import { defineStore } from 'pinia';
import { ref } from 'vue';

export type CadenceMode = 'follow' | 'force' | 'gradient' | 'overlay' | 'replace';
export type BeatSound = 'woodblock' | 'drum' | 'electronic' | 'voice';

export const useCadenceStore = defineStore('cadence', () => {
  const targetSPM = ref(180);
  const currentSPM = ref(0);
  const mode = ref<CadenceMode>('follow');
  const beatSound = ref<BeatSound>('woodblock');
  const beatVolume = ref(0.7);
  const isActive = ref(false);
  const gradientDuration = ref(300); // 5分钟渐变
  const voiceLanguage = ref<'zh' | 'en'>('zh');

  const presets = [160, 170, 180, 190, 200];

  return { targetSPM, currentSPM, mode, beatSound, beatVolume, isActive, gradientDuration, voiceLanguage, presets };
});
