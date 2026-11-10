import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeMode = 'darkRunner' | 'lightRunner' | 'nightHighContrast';

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>('darkRunner');
  const language = ref<'zh-CN' | 'en-US'>('zh-CN');
  const powerSaveMode = ref(false);
  const isInstalled = ref(false);
  const isOnline = ref(navigator.onLine);

  function setTheme(mode: ThemeMode) {
    theme.value = mode;
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('paomama-theme', mode);
  }

  function setLanguage(lang: 'zh-CN' | 'en-US') {
    language.value = lang;
    localStorage.setItem('paomama-lang', lang);
  }

  function togglePowerSave() {
    powerSaveMode.value = !powerSaveMode.value;
  }

  // 初始化
  const savedTheme = localStorage.getItem('paomama-theme') as ThemeMode | null;
  if (savedTheme) setTheme(savedTheme);
  const savedLang = localStorage.getItem('paomama-lang') as 'zh-CN' | 'en-US' | null;
  if (savedLang) language.value = savedLang;

  window.addEventListener('online', () => { isOnline.value = true; });
  window.addEventListener('offline', () => { isOnline.value = false; });

  return { theme, language, powerSaveMode, isInstalled, isOnline, setTheme, setLanguage, togglePowerSave };
});
