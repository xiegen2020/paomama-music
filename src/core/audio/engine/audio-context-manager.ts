export class AudioContextManager {
  private ctx: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private destinationNode: AudioDestinationNode | null = null;

  async initialize(): Promise<void> {
    this.ctx = new AudioContext({ sampleRate: 44100, latencyHint: 'interactive' });
    this.gainNode = this.ctx.createGain();
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.destinationNode = this.ctx.destination;
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.destinationNode);
  }

  async resumeOnUserGesture(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  async playBuffer(buffer: AudioBuffer): Promise<void> {
    if (!this.ctx || !this.gainNode) await this.initialize();
    await this.resumeOnUserGesture();
    this.stop();
    this.sourceNode = this.ctx!.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.connect(this.gainNode!);
    this.sourceNode.start(0);
  }

  stop(): void {
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch {}
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  setVolume(value: number): void {
    if (this.gainNode) this.gainNode.gain.value = Math.max(0, Math.min(1, value));
  }

  getAnalyserData(): Float32Array {
    if (!this.analyserNode) return new Float32Array(0);
    const data = new Float32Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(data as any);
    return data;
  }

  getCurrentTime(): number {
    return this.ctx?.currentTime ?? 0;
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  getGainNode(): GainNode | null {
    return this.gainNode;
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  async dispose(): Promise<void> {
    this.stop();
    if (this.ctx) {
      await this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioContextManager();
