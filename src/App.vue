<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import { useTheme } from '@/composables/useTheme';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const appStore = useAppStore();
const { initTheme } = useTheme();
const { t } = useI18n();
initTheme();

const navItems = computed(() => [
  { path: '/', icon: 'fa-home', label: t('nav.home') },
  { path: '/converter', icon: 'fa-file-audio', label: t('nav.converter') },
  { path: '/cadence', icon: 'fa-stopwatch', label: t('nav.cadence') },
  { path: '/editor', icon: 'fa-pen-to-square', label: t('nav.editor') },
  { path: '/reminder', icon: 'fa-bell', label: t('nav.reminder') },
  { path: '/library', icon: 'fa-music', label: t('nav.library') },
]);
</script>

<template>
  <div class="min-h-screen" style="background: #FAFAFA; color: #1A1A1A;">
    <!-- Top Header Bar -->
    <header class="sticky top-0 z-50 backdrop-blur-xl border-b" style="background: rgba(255,255,255,0.85); border-color: #F0F0F0;">
      <div class="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #E53935, #FF5252);">
            <span class="text-white font-bold text-sm">跑</span>
          </div>
          <span class="font-bold text-lg tracking-tight" style="color: #1A1A1A;">跑马吗</span>
        </router-link>
        <div class="flex items-center gap-2">
          <button
            class="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style="color: #8A8A8A;"
            @click="appStore.togglePowerSave()"
            :title="appStore.powerSaveMode ? '关闭省电模式' : '开启省电模式'"
          >
            <font-awesome-icon :icon="appStore.powerSaveMode ? 'fa-battery-half' : 'fa-battery-full'" class="text-lg" />
          </button>
          <router-link to="/settings" class="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style="color: #8A8A8A;">
            <font-awesome-icon icon="fa-gear" class="text-lg" />
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto pb-20">
      <router-view />
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t" style="background: rgba(255,255,255,0.9); border-color: #F0F0F0;">
      <div class="max-w-5xl mx-auto flex justify-around items-center h-16 px-2" style="padding-bottom: env(safe-area-inset-bottom, 0);">
        <router-link
          v-for="item in navItems" :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center min-w-12 min-h-12 rounded-xl transition-all duration-200 no-underline"
          :style="$route.path === item.path ? { color: '#E53935', background: 'rgba(229,57,53,0.05)' } : { color: '#8A8A8A' }"
        >
          <font-awesome-icon :icon="item.icon" class="text-xl" />
          <span class="text-xs mt-0.5 font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>
