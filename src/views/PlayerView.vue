<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { usePlayerStore } from '@/stores/player';
const { t } = useI18n();
const store = usePlayerStore();

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
</script>

<template>
  <div class="runner-section animate-slide-up">
    <div class="mb-6">
      <h1 class="text-runner-xl font-bold mb-1">{{ t('player.nowPlaying') }}</h1>
    </div>

    <!-- Album Art -->
    <div class="runner-card text-center py-8">
      <div class="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center mb-5" style="background: linear-gradient(135deg, #E53935, #FF5252); box-shadow: 0 4px 14px rgba(229,57,53,0.25);">
        <font-awesome-icon icon="fa-music" class="text-4xl text-white" />
      </div>
      <p class="text-runner-lg font-bold mb-1" style="color: #1A1A1A;">{{ store.currentSong?.title ?? '未选择歌曲' }}</p>
      <p class="text-runner-sm" style="color: #8A8A8A;">{{ store.currentSong?.artist ?? '从曲库中选择歌曲开始播放' }}</p>

      <!-- Progress -->
      <div class="mt-6 px-2">
        <input type="range" :value="store.progress" min="0" max="1" step="0.001" class="w-full" />
        <div class="flex justify-between text-runner-xs mt-1.5" style="color: #8A8A8A;">
          <span class="font-mono">{{ formatTime(store.currentTime) }}</span>
          <span class="font-mono">{{ formatTime(store.duration) }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex justify-center items-center gap-3 mt-6">
        <button class="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90" style="color: #4A4A4A;">
          <font-awesome-icon icon="fa-backward-step" class="text-xl" />
        </button>
        <button
          class="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90"
          style="background: linear-gradient(135deg, #E53935, #FF5252); color: white; box-shadow: 0 4px 14px rgba(229,57,53,0.25);"
        >
          <font-awesome-icon :icon="store.isPlaying ? 'fa-pause' : 'fa-play'" class="text-2xl" />
        </button>
        <button class="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90" style="color: #4A4A4A;">
          <font-awesome-icon icon="fa-forward-step" class="text-xl" />
        </button>
      </div>

      <!-- Volume -->
      <div class="flex items-center gap-3 mt-5 px-6">
        <font-awesome-icon icon="fa-volume-low" class="text-lg" style="color: #8A8A8A;" />
        <input type="range" :value="store.volume" min="0" max="1" step="0.01" class="flex-1" />
        <font-awesome-icon icon="fa-volume-high" class="text-lg" style="color: #8A8A8A;" />
      </div>
    </div>
  </div>
</template>
