import type { CadenceConfig, CadenceMode, BeatSound } from '@/core/types';

export class CadenceService {
  private config: CadenceConfig | null = null;
  private isActive = false;
  private metronomeInterval: number | null = null;
  private audioCtx: AudioContext | null = null;
  private onBeatCallback: ((time: number, beat: number) => void) | null = null;

  async start(config: CadenceConfig): Promise<void> {
    this.config = config;
    this.isActive = true;
    this.audioCtx = new AudioContext({ latencyHint: 'interactive' });

    const intervalMs = (60 / config.targetSPM) * 1000;
    let beatCount = 0;

    this.metronomeInterval = window.setInterval(() => {
      if (!this.isActive) return;
      beatCount++;
      this.onBeatCallback?.(performance.now(), beatCount);
      this.playBeatSound(config.beatSound, beatCount % 4 === 0);
    }, intervalMs);
  }

  async stop(): Promise<void> {
    this.isActive = false;
    if (this.metronomeInterval !== null) {
      clearInterval(this.metronomeInterval);
      this.metronomeInterval = null;
    }
    if (this.audioCtx) {
      await this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  async updateSPM(spm: number): Promise<void> {
    if (!this.config || !this.isActive) return;
    this.config.targetSPM = spm;
    await this.stop();
    await this.start(this.config);
  }

  async switchMode(mode: CadenceMode): Promise<void> {
    if (this.config) this.config.mode = mode;
  }

  async setBeatSound(sound: BeatSound): Promise<void> {
    if (this.config) this.config.beatSound = sound;
  }

  async previewBeat(sound: BeatSound): Promise<void> {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.3;

    const freqMap = { woodblock: 800, drum: 150, electronic: 440, voice: 600 };
    osc.frequency.value = freqMap[sound];
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    setTimeout(() => ctx.close(), 200);
  }

  onBeat(callback: (time: number, beat: number) => void): void {
    this.onBeatCallback = callback;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  private playBeatSound(sound: BeatSound, isAccent: boolean): void {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    gain.gain.value = isAccent ? 0.5 : 0.3;

    const freqMap = { woodblock: 800, drum: 150, electronic: 440, voice: 600 };
    osc.frequency.value = freqMap[sound];
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }
}

export const cadenceService = new CadenceService();
