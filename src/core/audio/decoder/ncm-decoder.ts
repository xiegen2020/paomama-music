import type { Decoder } from './decoder-factory';
import type { DecodeResult, AudioMetadata } from '@/core/types';
import { aes128EcbDecrypt, pkcs7Unpad } from './aes-ecb';
import { sniffAudioFormat } from './format-sniff';

// NCM 格式常量
// 参考: https://github.com/anonymous5l/ncmdump
const CORE_KEY = new Uint8Array([...'hzHRAmso5kInbaxW'].map((c) => c.charCodeAt(0)));
const META_KEY = new Uint8Array([...`#14ljk_!\\]&0U<'(`].map((c) => c.charCodeAt(0)));
const META_PREFIX = "163 key(Don't modify):";
const KEY_PREFIX = 'neteasecloudmusic'; // 17 字节

class NCMDecoder implements Decoder {
  readonly format = 'ncm' as const;
  readonly magicBytes = [0x43, 0x54, 0x45, 0x4e, 0x46, 0x44, 0x41, 0x4d]; // 'CTENFDAM'

  detect(buffer: ArrayBuffer): boolean {
    if (buffer.byteLength < 8) return false;
    const view = new Uint8Array(buffer, 0, 8);
    return this.magicBytes.every((b, i) => view[i] === b);
  }

  async decode(buffer: ArrayBuffer, _filename?: string): Promise<DecodeResult> {
    // NCM格式: 10字节头 | u32密钥长度 | AES-128-ECB加密密钥 | u32元数据长度 | AES加密元数据
    //          | u32 CRC32 | 5字节间隔 | u32封面长度 | 封面 | 加密音频流
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    let offset = 10; // 跳过 'CTENFDAM' + 2字节

    // 1. 解密音频密钥（先逐字节 XOR 0x64 去混淆，再 AES-128-ECB）
    const keyLength = view.getUint32(offset, true);
    offset += 4;
    if (keyLength === 0 || keyLength % 16 !== 0 || offset + keyLength > bytes.length) {
      throw new Error('NCM 密钥块长度非法');
    }
    const keyCipher = bytes.slice(offset, offset + keyLength);
    offset += keyLength;
    for (let i = 0; i < keyCipher.length; i++) keyCipher[i]! ^= 0x64;
    const plainKey = pkcs7Unpad(aes128EcbDecrypt(CORE_KEY, keyCipher));
    const audioKey = plainKey.slice(KEY_PREFIX.length);
    if (audioKey.length < 16) throw new Error('NCM 密钥解密失败');

    // 2. 解密元数据（先逐字节 XOR 0x63 去混淆，再 base64 + AES）
    const metaLength = view.getUint32(offset, true);
    offset += 4;
    let metadata: AudioMetadata = { title: '', artist: '', album: '', coverArt: null };
    if (metaLength > 0) {
      const metaObfuscated = bytes.slice(offset, offset + metaLength);
      offset += metaLength;
      try {
        for (let i = 0; i < metaObfuscated.length; i++) metaObfuscated[i]! ^= 0x63;
        const metaRaw = new TextDecoder().decode(metaObfuscated);
        const b64 = metaRaw.startsWith(META_PREFIX) ? metaRaw.slice(META_PREFIX.length) : metaRaw;
        const metaCipher = base64ToBytes(b64);
        const metaPlain = pkcs7Unpad(aes128EcbDecrypt(META_KEY, metaCipher));
        // 明文形如 "music:{...}"，去掉前 6 字节前缀
        const jsonStart = metaPlain[0] === 0x6d && metaPlain[5] === 0x3a ? 6 : 0; // 'm' ... ':'
        const metaJson = JSON.parse(new TextDecoder().decode(metaPlain.slice(jsonStart)));
        metadata = {
          title: metaJson?.musicName ?? '',
          artist: Array.isArray(metaJson?.artist) ? metaJson.artist.map((a: unknown[]) => a[0]).join('/') : '',
          album: metaJson?.album ?? '',
          coverArt: null,
        };
      } catch {
        // 元数据解析失败不阻塞解密
      }
    }

    // 3. 跳过 CRC32 (4字节) + 间隔 (5字节)
    offset += 9;

    // 4. 读取封面
    if (offset + 4 <= bytes.length) {
      const coverSize = view.getUint32(offset, true);
      offset += 4;
      if (coverSize > 0 && offset + coverSize <= bytes.length) {
        metadata.coverArt = extractCoverImage(bytes.slice(offset, offset + coverSize));
        offset += coverSize;
      }
    }

    // 5. 音频流解密 (XOR 密钥盒流密码)
    const audio = bytes.slice(offset);
    if (audio.length === 0) throw new Error('NCM 音频数据为空');
    decryptAudioStream(audio, audioKey);

    return { audioData: audio.buffer, format: sniffAudioFormat(audio) ?? 'mp3', metadata };
  }
}

// NCM 音频流解密: 类 RC4 的 XOR 密钥盒
function decryptAudioStream(data: Uint8Array, key: Uint8Array): void {
  const box = new Uint8Array(256);
  for (let i = 0; i < 256; i++) box[i] = i;

  let c = 0;
  let lastByte = 0;
  let keyOffset = 0;
  for (let i = 0; i < 256; i++) {
    const swap = box[i]!;
    c = (swap + lastByte + key[keyOffset]!) & 0xff;
    keyOffset = (keyOffset + 1) % key.length;
    box[i] = box[c]!;
    box[c] = swap;
    lastByte = c;
  }

  for (let i = 0; i < data.length; i++) {
    const j = (i + 1) & 0xff;
    data[i]! ^= box[(box[j]! + box[(box[j]! + j) & 0xff]!) & 0xff]!;
  }
}

// 从封面区域提取图片（封面块可能带内部帧头，直接按图片魔数扫描）
function extractCoverImage(data: Uint8Array): Blob | null {
  const magics: { sig: number[]; type: string }[] = [
    { sig: [0xff, 0xd8, 0xff], type: 'image/jpeg' },
    { sig: [0x89, 0x50, 0x4e, 0x47], type: 'image/png' },
    { sig: [0x47, 0x49, 0x46, 0x38], type: 'image/gif' },
    { sig: [0x52, 0x49, 0x46, 0x46], type: 'image/webp' },
  ];
  const limit = Math.min(data.length, 262144);
  for (const { sig, type } of magics) {
    scan: for (let i = 0; i + sig.length <= limit; i++) {
      for (let j = 0; j < sig.length; j++) {
        if (data[i + j] !== sig[j]) continue scan;
      }
      return new Blob([data.slice(i)], { type });
    }
  }
  return null;
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s/g, '');
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const ncmDecoder = new NCMDecoder();
