<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <div class="runner-section animate-slide-up">
    <div class="mb-6">
      <h1 class="text-runner-xl font-bold mb-1">{{ t('editor.title') }}</h1>
      <p style="color: #8A8A8A;" class="text-runner-sm">基于时间轴的音频编辑，智能拼接跑步音乐</p>
    </div>

    <!-- Timeline Area -->
    <div class="rounded-runner-xl border-2 border-dashed p-6 text-center mb-4" style="border-color: #E8E8E8; background: #F5F5F5;">
      <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style="background: rgba(229,57,53,0.08);">
        <font-awesome-icon icon="fa-timeline" class="text-2xl" style="color: #E53935;" />
      </div>
      <p class="font-semibold text-runner-base mb-1" style="color: #1A1A1A;">时间轴编辑器</p>
      <p class="text-runner-sm" style="color: #8A8A8A;">导入歌曲后在此编排跑步音乐</p>
    </div>

    <!-- Smart Arrange Options -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('editor.smartArrange') }}</h3>
      <div class="grid grid-cols-3 gap-2">
        <button class="flex flex-col items-center gap-2 p-3 rounded-runner transition-all cursor-pointer hover:shadow-md" style="background: #F5F5F5;">
          <font-awesome-icon icon="fa-clock" class="text-xl" style="color: #E53935;" />
          <span class="text-runner-xs font-medium" style="color: #4A4A4A;">{{ t('editor.targetDuration') }}</span>
        </button>
        <button class="flex flex-col items-center gap-2 p-3 rounded-runner transition-all cursor-pointer hover:shadow-md" style="background: #F5F5F5;">
          <font-awesome-icon icon="fa-location-dot" class="text-xl" style="color: #FF6D00;" />
          <span class="text-runner-xs font-medium" style="color: #4A4A4A;">{{ t('editor.timeNodes') }}</span>
        </button>
        <button class="flex flex-col items-center gap-2 p-3 rounded-runner transition-all cursor-pointer hover:shadow-md" style="background: #F5F5F5;">
          <font-awesome-icon icon="fa-arrows-rotate" class="text-xl" style="color: #00C853;" />
          <span class="text-runner-xs font-medium" style="color: #4A4A4A;">{{ t('editor.interval') }}</span>
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button class="runner-btn-primary flex-1 py-3">
        <font-awesome-icon icon="fa-wand-magic" class="text-lg mr-1.5" />
        {{ t('editor.smartArrange') }}
      </button>
      <button class="flex-1 py-3 rounded-runner font-semibold transition-all cursor-pointer border-2 active:scale-95" style="border-color: #E53935; color: #E53935;">
        <font-awesome-icon icon="fa-download" class="text-lg mr-1.5" />
        {{ t('editor.export') }}
      </button>
    </div>
  </div>
</template>
