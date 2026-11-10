import type { Decoder } from './decoder-factory';
import type { DecodeResult, AudioMetadata } from '@/core/types';
import { QmcMapCipher, QmcRC4Cipher, QmcStaticCipher, type QmcStreamCipher } from './qmc-cipher';
import { qmcDeriveKey } from './qmc-key';
import { sniffAudioFormat } from './format-sniff';

// 扩展名 → 期望输出格式（解密后优先按魔数识别，此为兜底）
const EXT_MAP: Record<string, string> = {
  mgg: 'ogg', mgg0: 'ogg', mggl: 'ogg', mgg1: 'ogg',
  mflac: 'flac', mflac0: 'flac', mmp4: 'm4a',
  qmcflac: 'flac', qmcogg: 'ogg',
  qmc0: 'mp3', qmc2: 'ogg', qmc3: 'mp3', qmc4: 'ogg', qmc6: 'ogg', qmc8: 'ogg',
  bkcmp3: 'mp3', bkcm4a: 'm4a', bkcflac: 'flac', bkcwav: 'wav', bkcape: 'ape',
  bkcogg: 'ogg', bkcwma: 'wma', tkm: 'm4a',
  // 十六进制扩展名（部分下载源使用）
  '666c6163': 'flac', '6d7033': 'mp3', '6f6767': 'ogg', '6d3461': 'm4a', '776176': 'wav',
};

class QMCDecoder implements Decoder {
  readonly format = 'qmc' as const;
  // QMC 文件无固定魔数（整体加密），依赖扩展名识别
  readonly magicBytes: number[] = [];

  detect(_buffer: ArrayBuffer): boolean {
    return false;
  }

  detectByName(name: string): boolean {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return ext in EXT_MAP;
  }

  async decode(buffer: ArrayBuffer, filename = ''): Promise<DecodeResult> {
    const file = new Uint8Array(buffer);
    const size = file.length;
    if (size < 16) throw new Error('QMC 文件过小');

    const textDec = new TextDecoder();
    const last4 = file.slice(size - 4);
    const tailTag = textDec.decode(last4);
    let audioSize: number;
    let cipher: QmcStreamCipher;

    if (tailTag === 'STag') {
      throw new Error('该 QMC 文件未写入密钥（STag），无法解密');
    } else if (tailTag === 'QTag') {
      // QTag: 大端 u32 记录密钥区长度（含末尾8字节）
      const keySize = new DataView(file.buffer, file.byteOffset + size - 8).getUint32(0, false);
      audioSize = size - keySize - 8;
      if (audioSize <= 0 || audioSize >= size) throw new Error('QMC QTag 密钥区长度非法');
      const rawKey = file.subarray(audioSize, size - 8);
      const comma = rawKey.indexOf(0x2c); // ','
      if (comma < 0) throw new Error('QMC QTag 密钥解析失败');
      cipher = this.makeCipher(rawKey.subarray(0, comma));
    } else {
      // 小端 u32 记录密钥长度；≥0x400 视为无密钥（静态密码盒）
      const keySize = new DataView(file.buffer, file.byteOffset + size - 4).getUint32(0, true);
      if (keySize > 0 && keySize < 0x400) {
        audioSize = size - keySize - 4;
        if (audioSize <= 0 || audioSize >= size) throw new Error('QMC 密钥区长度非法');
        cipher = this.makeCipher(file.subarray(audioSize, size - 4));
      } else {
        audioSize = size;
        cipher = new QmcStaticCipher();
      }
    }

    const audio = file.slice(0, audioSize);
    cipher.decrypt(audio, 0);

    const ext = sniffAudioFormat(audio)
      ?? EXT_MAP[filename.split('.').pop()?.toLowerCase() ?? ''] ?? 'mp3';
    const metadata: AudioMetadata = { title: '', artist: '', album: '', coverArt: null };
    return { audioData: audio.buffer, format: ext, metadata };
  }

  private makeCipher(rawKey: Uint8Array): QmcStreamCipher {
    const key = qmcDeriveKey(rawKey);
    if (key.length > 300) return new QmcRC4Cipher(key);
    return new QmcMapCipher(key);
  }
}

export const qmcDecoder = new QMCDecoder();
