import type { CadenceMode } from '@/core/types';

export interface BPMMatchResult {
  playbackRate: number;
  timeStretch?: number;
  overlayBeat?: boolean;
  replaceBeat?: boolean;
  gradientSteps?: { time: number; bpm: number }[];
}

export function matchBPM(mode: CadenceMode, audioBPM: number, targetSPM: number, gradientDuration = 300): BPMMatchResult {
  switch (mode) {
    case 'follow':
      return { playbackRate: targetSPM / (audioBPM * 2) };
    case 'force':
      return { playbackRate: 1, timeStretch: targetSPM / (audioBPM * 2) };
    case 'gradient': {
      const steps = 10;
      const gradientSteps: { time: number; bpm: number }[] = [];
      for (let i = 0; i <= steps; i++) {
        gradientSteps.push({
          time: (gradientDuration / steps) * i,
          bpm: audioBPM + (targetSPM / 2 - audioBPM) * (i / steps),
        });
      }
      return { playbackRate: 1, gradientSteps };
    }
    case 'overlay':
      return { playbackRate: 1, overlayBeat: true };
    case 'replace':
      return { playbackRate: 1, replaceBeat: true };
    default:
      return { playbackRate: 1 };
  }
}
