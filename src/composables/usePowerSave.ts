import { useAppStore } from '@/stores/app';

export function usePowerSave() {
  const appStore = useAppStore();

  function enable() {
    appStore.powerSaveMode = true;
  }

  function disable() {
    appStore.powerSaveMode = false;
  }

  function toggle() {
    appStore.togglePowerSave();
  }

  return { enable, disable, toggle, isEnabled: () => appStore.powerSaveMode };
}
