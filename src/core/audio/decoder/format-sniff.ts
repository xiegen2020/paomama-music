// 通过魔数识别常见音频容器格式
export function sniffAudioFormat(data: Uint8Array): string | null {
  if (data.length < 12) return null;
  // MP3: ID3 标签或帧同步 (0xFFEx / 0xFFFx)
  if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) return 'mp3';
  if (data[0] === 0xff && (data[1]! & 0xe0) === 0xe0) return 'mp3';
  // FLAC: 'fLaC'
  if (data[0] === 0x66 && data[1] === 0x4c && data[2] === 0x61 && data[3] === 0x63) return 'flac';
  // OGG: 'OggS'
  if (data[0] === 0x4f && data[1] === 0x67 && data[2] === 0x67 && data[3] === 0x53) return 'ogg';
  // MP4/M4A: offset 4 为 'ftyp'
  if (data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70) return 'm4a';
  // WAV: 'RIFF'...'WAVE'
  if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46
    && data[8] === 0x57 && data[9] === 0x41 && data[10] === 0x56 && data[11] === 0x45) return 'wav';
  return null;
}
