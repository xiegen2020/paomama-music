import type { EncryptedFormat, DecodeResult } from '@/core/types';
import { sniffAudioFormat } from './format-sniff';

interface Decoder {
  readonly format: EncryptedFormat;
  readonly magicBytes: number[];
  detect(buffer: ArrayBuffer): boolean;
  /** 无魔数的格式（如 QMC）按扩展名识别 */
  detectByName?(name: string): boolean;
  decode(buffer: ArrayBuffer, filename?: string): Promise<DecodeResult>;
}

class DecoderFactory {
  private decoders = new Map<EncryptedFormat, Decoder>();

  register(decoder: Decoder): void {
    this.decoders.set(decoder.format, decoder);
  }

  async detectFormat(buffer: ArrayBuffer, filename = ''): Promise<EncryptedFormat | null> {
    // 优先魔数识别
    for (const [format, decoder] of this.decoders) {
      if (decoder.magicBytes.length > 0 && decoder.detect(buffer)) return format;
    }
    // 其次扩展名识别
    for (const [format, decoder] of this.decoders) {
      if (decoder.detectByName?.(filename)) return format;
    }
    return null;
  }

  async decode(file: File): Promise<DecodeResult> {
    const buffer = await file.arrayBuffer();
    const format = await this.detectFormat(buffer, file.name);
    if (!format) throw new Error(`不支持的格式: ${file.name}`);
    const decoder = this.decoders.get(format)!;
    return decoder.decode(buffer, file.name);
  }

  // 解密 + 明文音频统一入口：加密格式先解密，普通音频(mp3/flac/wav/m4a/ogg)直接进入转码管线
  async decodeAny(file: File): Promise<DecodeResult> {
    const buffer = await file.arrayBuffer();
    const format = await this.detectFormat(buffer, file.name);
    if (format) return this.decoders.get(format)!.decode(buffer, file.name);
    const rawFormat = sniffAudioFormat(new Uint8Array(buffer));
    if (rawFormat) {
      return {
        audioData: buffer,
        format: rawFormat,
        metadata: { title: '', artist: '', album: '', coverArt: null },
      };
    }
    throw new Error(`不支持的格式: ${file.name}`);
  }

  getSupportedFormats(): EncryptedFormat[] {
    return Array.from(this.decoders.keys());
  }
}

export const decoderFactory = new DecoderFactory();

// 注册内置解码器
import { ncmDecoder } from './ncm-decoder';
import { qmcDecoder } from './qmc-decoder';
import { kgmDecoder } from './kgm-decoder';
import { kwmDecoder } from './kwm-decoder';

decoderFactory.register(ncmDecoder);
decoderFactory.register(qmcDecoder);
decoderFactory.register(kgmDecoder);
decoderFactory.register(kwmDecoder);

export type { Decoder };
