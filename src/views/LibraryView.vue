<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLibraryStore } from '@/stores/library';
const { t } = useI18n();
const store = useLibraryStore();
</script>

<template>
  <div class="runner-section animate-slide-up">
    <div class="mb-6">
      <h1 class="text-runner-xl font-bold mb-1">{{ t('library.title') }}</h1>
      <p style="color: #8A8A8A;" class="text-runner-sm">管理你的跑步音乐曲库</p>
    </div>

    <!-- Search & Import -->
    <div class="flex gap-2 mb-4">
      <div class="flex-1 relative">
        <font-awesome-icon icon="fa-search" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg" style="color: #8A8A8A;" />
        <input v-model="store.searchQuery" class="runner-input pl-10" placeholder="搜索歌曲..." />
      </div>
      <button class="runner-btn-primary px-4">
        <font-awesome-icon icon="fa-plus" class="text-lg mr-1" />
        {{ t('library.import') }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="store.songs.length === 0" class="rounded-runner-xl border-2 border-dashed p-10 text-center" style="border-color: #E8E8E8; background: #F5F5F5;">
      <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background: rgba(229,57,53,0.08);">
        <font-awesome-icon icon="fa-music" class="text-3xl" style="color: #E53935;" />
      </div>
      <p class="font-semibold text-runner-base mb-1" style="color: #1A1A1A;">曲库为空</p>
      <p class="text-runner-sm" style="color: #8A8A8A;">点击导入添加歌曲，或从格式转换器转入</p>
    </div>

    <!-- Song List -->
    <div v-else class="space-y-2">
      <div v-for="song in store.filteredSongs" :key="song.id" class="runner-card flex items-center gap-3 py-3">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center" style="background: rgba(229,57,53,0.08);">
          <font-awesome-icon icon="fa-music" class="text-lg" style="color: #E53935;" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-runner-sm font-semibold truncate" style="color: #1A1A1A;">{{ song.title }}</p>
          <p class="text-runner-xs truncate" style="color: #8A8A8A;">{{ song.artist }}</p>
        </div>
        <span v-if="song.bpm" class="runner-badge-primary">{{ song.bpm }} BPM</span>
        <span v-else class="runner-badge" style="background: #F5F5F5; color: #8A8A8A;">---</span>
      </div>
    </div>
  </div>
</template>
