type BeatSoundType = 'woodblock' | 'drum' | 'electronic' | 'voice';

class MetronomeProcessor extends AudioWorkletProcessor {
  private spm = 180;
  private beatInterval = 60 / this.spm;
  private nextBeatTime = 0;
  private beatCount = 0;
  private soundType: BeatSoundType = 'woodblock';
  private accentPattern = 4; // 每4拍一个强拍
  private phase = 0;
  private phaseDecay = 0;

  constructor() {
    super();
    this.port.onmessage = (e) => {
      if (e.data.type === 'setSPM') {
        this.spm = Math.max(120, Math.min(220, e.data.spm));
        this.beatInterval = 60 / this.spm;
      }
      if (e.data.type === 'setSound') {
        this.soundType = e.data.sound;
      }
    };
  }

  private generateBeat(isAccent: boolean): number {
    const amp = isAccent ? 0.8 : 0.5;
    switch (this.soundType) {
      case 'woodblock':
        return Math.sin(2 * Math.PI * 800 * this.phase) * amp * this.phaseDecay;
      case 'drum':
        return Math.sin(2 * Math.PI * 150 * this.phase) * amp * this.phaseDecay;
      case 'electronic':
        return (Math.random() * 2 - 1) * amp * this.phaseDecay;
      default:
        return Math.sin(2 * Math.PI * 600 * this.phase) * amp * this.phaseDecay;
    }
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Record<string, Float32Array>): boolean {
    const output = outputs[0];
    if (!output || output.length === 0) return true;

    const currentTime = currentFrame / sampleRate;

    if (currentTime >= this.nextBeatTime) {
      this.nextBeatTime = currentTime + this.beatInterval;
      this.beatCount++;
      this.phaseDecay = 1;
      const isAccent = this.beatCount % this.accentPattern === 0;
      this.port.postMessage({ type: 'beat', time: currentTime, beat: this.beatCount, accent: isAccent });
    }

    for (let channel = 0; channel < output.length; channel++) {
      const ch = output[channel]!;
      for (let i = 0; i < ch.length; i++) {
        if (this.phaseDecay > 0) {
          const isAccent = this.beatCount % this.accentPattern === 0;
          ch[i] = this.generateBeat(isAccent);
          this.phase += 1 / sampleRate;
          this.phaseDecay -= 1 / (sampleRate * 0.08);
          if (this.phaseDecay < 0) this.phaseDecay = 0;
        } else {
          ch[i] = 0;
          this.phase = 0;
        }
      }
    }

    return true;
  }
}

// @ts-ignore
registerProcessor('metronome-processor', MetronomeProcessor);
