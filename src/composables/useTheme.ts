import { useAppStore, type ThemeMode } from '@/stores/app';

export function useTheme() {
  const appStore = useAppStore();

  function initTheme() {
    const saved = localStorage.getItem('paomama-theme') as ThemeMode | null;
    if (saved) {
      appStore.setTheme(saved);
    } else {
      // 默认深色跑步模式
      appStore.setTheme('darkRunner');
    }
  }

  function setTheme(mode: ThemeMode) {
    appStore.setTheme(mode);
  }

  function cycleTheme() {
    const themes: ThemeMode[] = ['darkRunner', 'lightRunner', 'nightHighContrast'];
    const idx = themes.indexOf(appStore.theme);
    const next = themes[(idx + 1) % themes.length]!;
    setTheme(next);
  }

  return { initTheme, setTheme, cycleTheme };
}
