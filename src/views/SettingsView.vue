<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAppStore, type ThemeMode } from '@/stores/app';
const { t, locale } = useI18n();
const appStore = useAppStore();

const themes: { value: ThemeMode; label: string; desc: string; preview: string }[] = [
  { value: 'darkRunner', label: t('settings.darkRunner'), desc: '深色背景，适合户外', preview: '#0F0F0F' },
  { value: 'lightRunner', label: t('settings.lightRunner'), desc: '浅色背景，适合室内', preview: '#FAFAFA' },
  { value: 'nightHighContrast', label: t('settings.nightHighContrast'), desc: '纯黑高对比，夜间跑步', preview: '#000000' },
];

function switchLanguage() {
  const next = appStore.language === 'zh-CN' ? 'en-US' : 'zh-CN';
  appStore.setLanguage(next);
  locale.value = next;
}
</script>

<template>
  <div class="runner-section animate-slide-up">
    <div class="mb-6">
      <h1 class="text-runner-xl font-bold mb-1">{{ t('settings.title') }}</h1>
    </div>

    <!-- Theme -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('settings.theme') }}</h3>
      <div class="space-y-2">
        <button
          v-for="th in themes" :key="th.value"
          class="w-full flex items-center gap-3 p-3 rounded-runner transition-all duration-200 cursor-pointer border-2"
          :style="appStore.theme === th.value
            ? { borderColor: '#E53935', background: 'rgba(229,57,53,0.05)' }
            : { borderColor: '#E8E8E8', background: '#F5F5F5' }"
          @click="appStore.setTheme(th.value)"
        >
          <div class="w-8 h-8 rounded-lg border" :style="{ background: th.preview, borderColor: '#E8E8E8' }" />
          <div class="text-left">
            <p class="font-semibold text-runner-sm" :style="{ color: appStore.theme === th.value ? '#E53935' : '#1A1A1A' }">{{ th.label }}</p>
            <p class="text-runner-xs" style="color: #8A8A8A;">{{ th.desc }}</p>
          </div>
          <font-awesome-icon v-if="appStore.theme === th.value" icon="fa-check" class="ml-auto text-lg" style="color: #E53935;" />
        </button>
      </div>
    </div>

    <!-- Language -->
    <div class="runner-card mb-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold text-runner-base" style="color: #1A1A1A;">{{ t('settings.language') }}</p>
          <p class="text-runner-xs" style="color: #8A8A8A;">界面显示语言</p>
        </div>
        <button
          class="px-4 py-2 rounded-runner text-runner-sm font-semibold transition-all cursor-pointer border-2"
          style="border-color: #E53935; color: #E53935;"
          @click="switchLanguage"
        >{{ appStore.language === 'zh-CN' ? '中文' : 'English' }}</button>
      </div>
    </div>

    <!-- Power Save -->
    <div class="runner-card mb-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold text-runner-base" style="color: #1A1A1A;">{{ t('settings.powerSave') }}</p>
          <p class="text-runner-xs" style="color: #8A8A8A;">降低动画，延长续航</p>
        </div>
        <button
          class="w-12 h-7 rounded-full transition-all duration-200 cursor-pointer relative"
          :style="appStore.powerSaveMode ? { background: 'linear-gradient(135deg, #E53935, #FF5252)' } : { background: '#E8E8E8' }"
          @click="appStore.togglePowerSave()"
        >
          <div
            class="w-5 h-5 bg-white absolute top-1 transition-all duration-200 rounded-full"
            :style="{ left: appStore.powerSaveMode ? '26px' : '3px' }"
          />
        </button>
      </div>
    </div>

    <!-- Backup -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('settings.backup') }}</h3>
      <div class="grid grid-cols-2 gap-2">
        <button class="flex items-center justify-center gap-2 py-3 rounded-runner font-semibold transition-all cursor-pointer" style="background: #F5F5F5; color: #4A4A4A;">
          <font-awesome-icon icon="fa-upload" class="text-lg" />
          {{ t('settings.exportBackup') }}
        </button>
        <button class="flex items-center justify-center gap-2 py-3 rounded-runner font-semibold transition-all cursor-pointer" style="background: #F5F5F5; color: #4A4A4A;">
          <font-awesome-icon icon="fa-download" class="text-lg" />
          {{ t('settings.importBackup') }}
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="runner-card text-center">
      <div class="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style="background: linear-gradient(135deg, #E53935, #FF5252);">
        <span class="text-white font-bold text-sm">跑</span>
      </div>
      <p class="font-bold text-runner-base" style="color: #1A1A1A;">跑马吗 v1.0</p>
      <p class="text-runner-xs mt-1" style="color: #8A8A8A;">用对的节奏，跑更远的距离</p>
    </div>
  </div>
</template>
