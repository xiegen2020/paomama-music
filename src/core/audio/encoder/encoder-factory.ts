import type { OutputFormat, EncodeOptions } from '@/core/types';

interface Encoder {
  readonly format: OutputFormat;
  encode(audioData: ArrayBuffer, options: EncodeOptions): Promise<Blob>;
  estimateSize(durationSec: number, options: EncodeOptions): number;
}

class EncoderFactory {
  private encoders = new Map<OutputFormat, Encoder>();

  register(encoder: Encoder): void {
    this.encoders.set(encoder.format, encoder);
  }

  async encode(audioData: ArrayBuffer, options: EncodeOptions): Promise<Blob> {
    const encoder = this.encoders.get(options.format);
    if (!encoder) throw new Error(`不支持的输出格式: ${options.format}`);
    return encoder.encode(audioData, options);
  }

  estimateSize(durationSec: number, options: EncodeOptions): number {
    const encoder = this.encoders.get(options.format);
    if (!encoder) return 0;
    return encoder.estimateSize(durationSec, options);
  }
}

// WAV编码器：先解码为PCM，再封装为标准WAV
class WAVLEncoder implements Encoder {
  readonly format = 'wav' as const;

  async encode(audioData: ArrayBuffer, _options: EncodeOptions): Promise<Blob> {
    const ctx = new AudioContext();
    try {
      const audioBuffer = await ctx.decodeAudioData(audioData.slice(0));
      return audioBufferToWav(audioBuffer);
    } finally {
      void ctx.close();
    }
  }

  estimateSize(durationSec: number, options: EncodeOptions): number {
    return durationSec * options.sampleRate * options.channels * 2 + 44;
  }
}

// lamejs 支持的采样率表
const LAME_SAMPLE_RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];

// MP3编码器（lamejs 纯JS实现，按需动态加载）
class MP3Encoder implements Encoder {
  readonly format = 'mp3' as const;

  async encode(audioData: ArrayBuffer, options: EncodeOptions): Promise<Blob> {
    const { Mp3Encoder } = await import('@breezystack/lamejs');
    const ctx = new AudioContext();
    let buffer: AudioBuffer;
    try {
      buffer = await ctx.decodeAudioData(audioData.slice(0));
    } finally {
      void ctx.close();
    }

    let sampleRate = buffer.sampleRate;
    if (!LAME_SAMPLE_RATES.includes(sampleRate)) {
      buffer = resampleBuffer(buffer, 44100);
      sampleRate = 44100;
    }

    const numCh = Math.min(buffer.numberOfChannels, 2);
    const kbps = Math.round(options.bitrate / 1000);
    const encoder = new Mp3Encoder(numCh, sampleRate, kbps);
    const left = floatToInt16(buffer.getChannelData(0));
    const right = numCh > 1 ? floatToInt16(buffer.getChannelData(1)) : undefined;

    const chunks: Uint8Array[] = [];
    const blockSize = 1152 * 16;
    for (let i = 0; i < left.length; i += blockSize) {
      const l = left.subarray(i, i + blockSize);
      const data = right
        ? encoder.encodeBuffer(l, right.subarray(i, i + blockSize))
        : encoder.encodeBuffer(l);
      if (data.length > 0) chunks.push(new Uint8Array(data));
    }
    const tail = encoder.flush();
    if (tail.length > 0) chunks.push(new Uint8Array(tail));
    return new Blob(chunks, { type: 'audio/mpeg' });
  }

  estimateSize(durationSec: number, options: EncodeOptions): number {
    return (durationSec * options.bitrate) / 8;
  }
}

function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

// 线性插值重采样（lamejs 不支持非常用采样率时兜底）
function resampleBuffer(buffer: AudioBuffer, targetRate: number): AudioBuffer {
  const ratio = targetRate / buffer.sampleRate;
  const frames = Math.round(buffer.length * ratio);
  const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: frames, sampleRate: targetRate });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = out.getChannelData(c);
    for (let i = 0; i < frames; i++) {
      const pos = i / ratio;
      const i0 = Math.floor(pos);
      const i1 = Math.min(i0 + 1, src.length - 1);
      const frac = pos - i0;
      dst[i] = src[i0]! * (1 - frac) + src[i1]! * frac;
    }
  }
  return out;
}

// AudioBuffer → 16bit PCM WAV
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const frames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const dataSize = frames * blockAlign;

  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c]![i]!));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([out], { type: 'audio/wav' });
}

function writeStr(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

export const encoderFactory = new EncoderFactory();
encoderFactory.register(new WAVLEncoder());
encoderFactory.register(new MP3Encoder());
export type { Encoder };
