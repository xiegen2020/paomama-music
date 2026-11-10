import type { Decoder } from './decoder-factory';
import type { DecodeResult, AudioMetadata } from '@/core/types';
import { sniffAudioFormat } from './format-sniff';
import { KGM_TABLE1, KGM_TABLE2, KGM_TABLE_V2, KGM_VPR_KEY } from './kgm-tables';

const KGM_HEADER = [0x7c, 0xd5, 0x32, 0xeb, 0x86, 0x02, 0x7f, 0x4b, 0xa8, 0xaf, 0xa6, 0x8e, 0x0f, 0xff, 0x99, 0x14];
const VPR_HEADER = [0x05, 0x28, 0xbc, 0x96, 0xe9, 0xe4, 0x5a, 0x43, 0x91, 0xaa, 0xbd, 0xd0, 0x7a, 0xf5, 0x36, 0x31];

const TABLE_SIZE = 16 * 17;

function hasPrefix(data: Uint8Array, prefix: number[]): boolean {
  if (data.length < prefix.length) return false;
  return prefix.every((b, i) => data[i] === b);
}

// 高位折叠异或掩码（KGM 密钥流的核心查表）
function getMaskByteAtOffset(offset: number): number {
  let value = 0;
  let off = offset;
  while (off >= 0x11) {
    value ^= KGM_TABLE1[off % TABLE_SIZE]!;
    off >>>= 4;
    value ^= KGM_TABLE2[off % TABLE_SIZE]!;
    off >>>= 4;
  }
  return value;
}

function getMaskByteAtOffsetV2(offset: number): number {
  return KGM_TABLE_V2[offset % TABLE_SIZE]! ^ getMaskByteAtOffset(offset >>> 4);
}

function xorLowerHalfByte(x: number): number {
  return x ^ ((x & 0x0f) << 4);
}

export function decryptKgmByteAtOffsetV2(encryptedByte: number, fileKey: Uint8Array, offset: number): number {
  return xorLowerHalfByte(getMaskByteAtOffsetV2(offset) ^ encryptedByte ^ fileKey[offset % 17]!);
}

export function decryptVprByteAtOffset(encryptedByte: number, fileKey: Uint8Array, offset: number): number {
  return decryptKgmByteAtOffsetV2(encryptedByte, fileKey, offset) ^ KGM_VPR_KEY[offset % 17]!;
}

class KGMDecoder implements Decoder {
  readonly format = 'kgm' as const;
  readonly magicBytes = KGM_HEADER;

  detect(buffer: ArrayBuffer): boolean {
    const view = new Uint8Array(buffer);
    return hasPrefix(view, KGM_HEADER) || hasPrefix(view, VPR_HEADER);
  }

  detectByName(name: string): boolean {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return ext === 'kgm' || ext === 'kgma' || ext === 'vpr';
  }

  async decode(buffer: ArrayBuffer): Promise<DecodeResult> {
    const data = new Uint8Array(buffer);
    const isVpr = hasPrefix(data, VPR_HEADER);
    if (!isVpr && !hasPrefix(data, KGM_HEADER)) throw new Error('不是有效的 KGM/VPR 文件');

    if (data.length < 0x2c) throw new Error('KGM 文件头不完整');
    const headerLen = new DataView(data.buffer, data.byteOffset + 0x10).getUint32(0, true);
    if (headerLen <= 0 || headerLen >= data.length) throw new Error('KGM 头部长度非法');

    // key1: 16 字节 + 末尾补 0（共 17 项，offset%17==16 时取 0）
    const key1 = new Uint8Array(17);
    key1.set(data.subarray(0x1c, 0x2c), 0);

    const audio = data.slice(headerLen);
    const decryptByte = isVpr ? decryptVprByteAtOffset : decryptKgmByteAtOffsetV2;
    for (let i = 0; i < audio.length; i++) {
      audio[i] = decryptByte(audio[i]!, key1, i);
    }

    const metadata: AudioMetadata = { title: '', artist: '', album: '', coverArt: null };
    return {
      audioData: audio.buffer,
      format: sniffAudioFormat(audio) ?? 'mp3',
      metadata,
    };
  }
}

export const kgmDecoder = new KGMDecoder();
