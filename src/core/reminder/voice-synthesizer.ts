export class VoiceSynthesizer {
  private speechAPI: SpeechSynthesis | null = null;
  private musicDuckVolume = 0.2;

  constructor() {
    if (typeof speechSynthesis !== 'undefined') {
      this.speechAPI = speechSynthesis;
    }
  }

  async speak(text: string, language: 'zh' | 'en' = 'zh'): Promise<void> {
    if (this.speechAPI) {
      await this.speakWithAPI(text, language);
    } else {
      console.warn('Web Speech API不可用，语音播报功能受限');
    }
  }

  private async speakWithAPI(text: string, language: 'zh' | 'en'): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      this.speechAPI!.speak(utterance);
    });
  }

  getMusicDuckVolume(): number {
    return this.musicDuckVolume;
  }

  isAvailable(): boolean {
    return this.speechAPI !== null;
  }
}

export const voiceSynthesizer = new VoiceSynthesizer();
