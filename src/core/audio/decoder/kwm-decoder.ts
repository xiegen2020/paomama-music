import type { Decoder } from './decoder-factory';
import type { DecodeResult, AudioMetadata } from '@/core/types';
import { sniffAudioFormat } from './format-sniff';

// 酷我 KWM: 头魔数 + 文件内密钥派生 XOR 流
const MAGIC_HEADER = new Uint8Array([
  0x79, 0x65, 0x65, 0x6c, 0x69, 0x6f, 0x6e, 0x2d, // 'yeelion-'
  0x6b, 0x75, 0x77, 0x6f, 0x2d, 0x74, 0x6d, 0x65, // 'kuwo-tme'
]);
const MAGIC_HEADER2 = new Uint8Array([
  0x79, 0x65, 0x65, 0x6c, 0x69, 0x6f, 0x6e, 0x2d,
  0x6b, 0x75, 0x77, 0x6f, 0x00, 0x00, 0x00, 0x00,
]);
const PRE_DEFINED_KEY = 'MoOtOiTvINGwd2E6n0E1i7L5t2IoOoNk';

function hasPrefix(data: Uint8Array, prefix: Uint8Array): boolean {
  if (data.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (data[i] !== prefix[i]) return false;
  }
  return true;
}

function createMaskFromKey(keyBytes: Uint8Array): Uint8Array {
  const keyView = new DataView(keyBytes.buffer, keyBytes.byteOffset, keyBytes.byteLength);
  const keyStrRaw = keyView.getBigUint64(0, true).toString();
  // 裁剪或重复填充到 32 字符
  let keyStr: string;
  if (keyStrRaw.length > 32) {
    keyStr = keyStrRaw.slice(0, 32);
  } else if (keyStrRaw.length < 32) {
    keyStr = keyStrRaw.padEnd(32, keyStrRaw);
  } else {
    keyStr = keyStrRaw;
  }
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = PRE_DEFINED_KEY.charCodeAt(i) ^ keyStr.charCodeAt(i);
  }
  return key;
}

class KWMDecoder implements Decoder {
  readonly format = 'kwm' as const;
  readonly magicBytes = Array.from(MAGIC_HEADER.slice(0, 8));

  detect(buffer: ArrayBuffer): boolean {
    const view = new Uint8Array(buffer);
    return hasPrefix(view, MAGIC_HEADER) || hasPrefix(view, MAGIC_HEADER2);
  }

  detectByName(name: string): boolean {
    return name.split('.').pop()?.toLowerCase() === 'kwm';
  }

  async decode(buffer: ArrayBuffer): Promise<DecodeResult> {
    const data = new Uint8Array(buffer);
    if (!this.detect(buffer)) throw new Error('不是有效的 KWM 文件');
    if (data.length <= 0x400) throw new Error('KWM 文件过小');

    const fileKey = data.slice(0x18, 0x20);
    const mask = createMaskFromKey(fileKey);

    const audio = data.slice(0x400);
    for (let cur = 0; cur < audio.length; cur++) {
      audio[cur] = audio[cur]! ^ mask[cur % 0x20]!;
    }

    const metadata: AudioMetadata = { title: '', artist: '', album: '', coverArt: null };
    return {
      audioData: audio.buffer,
      format: sniffAudioFormat(audio) ?? 'mp3',
      metadata,
    };
  }
}

export const kwmDecoder = new KWMDecoder();
