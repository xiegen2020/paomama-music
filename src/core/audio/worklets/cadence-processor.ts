class CadenceProcessor extends AudioWorkletProcessor {
  private targetSPM = 180;
  private beatInterval = 60 / this.targetSPM;
  private nextBeatTime = 0;
  private beatCount = 0;
  private beatDuration = 0.05; // 50ms节拍音效
  private beatPhase = 0;

  constructor() {
    super();
    this.port.onmessage = (e) => {
      if (e.data.type === 'setSPM') {
        this.targetSPM = Math.max(120, Math.min(220, e.data.spm));
        this.beatInterval = 60 / this.targetSPM;
      }
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Record<string, Float32Array>): boolean {
    const output = outputs[0];
    if (!output || output.length === 0) return true;

    const currentTime = currentFrame / sampleRate;

    if (currentTime >= this.nextBeatTime) {
      this.nextBeatTime = currentTime + this.beatInterval;
      this.beatPhase = 1;
      this.beatCount++;
      this.port.postMessage({ type: 'beat', time: currentTime, beat: this.beatCount, spm: this.targetSPM });
    }

    // 生成节拍音效（简短的正弦波脉冲）
    for (let channel = 0; channel < output.length; channel++) {
      const ch = output[channel]!;
      for (let i = 0; i < ch.length; i++) {
        if (this.beatPhase > 0) {
          ch[i] = Math.sin(2 * Math.PI * 1000 * this.beatPhase) * this.beatPhase * 0.5;
          this.beatPhase -= 1 / (sampleRate * this.beatDuration);
          if (this.beatPhase < 0) this.beatPhase = 0;
        } else {
          ch[i] = 0;
        }
      }
    }

    return true;
  }
}

// @ts-ignore - AudioWorkletProcessor全局注册
registerProcessor('cadence-processor', CadenceProcessor);
