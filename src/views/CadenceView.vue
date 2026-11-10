<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useCadenceStore } from '@/stores/cadence';
const { t } = useI18n();
const store = useCadenceStore();
const modes = [
  { key: 'follow' as const, label: '跟随', desc: '音乐BPM跟随步频', icon: 'fa-arrows-rotate' },
  { key: 'force' as const, label: '强制', desc: '强制调整到目标步频', icon: 'fa-bolt' },
  { key: 'gradient' as const, label: '渐变', desc: '平滑过渡到目标BPM', icon: 'fa-chart-line' },
  { key: 'overlay' as const, label: '叠加', desc: '在音乐上叠加节拍', icon: 'fa-plus' },
  { key: 'replace' as const, label: '替换', desc: '用节拍替换鼓点', icon: 'fa-exclamation' },
];
const sounds = [
  { key: 'woodblock' as const, label: '木鱼', icon: 'fa-circle' },
  { key: 'drum' as const, label: '鼓点', icon: 'fa-circle-half-stroke' },
  { key: 'electronic' as const, label: '电子', icon: 'fa-bolt' },
  { key: 'voice' as const, label: '语音', icon: 'fa-microphone' },
];
</script>

<template>
  <div class="runner-section animate-slide-up">
    <div class="mb-6">
      <h1 class="text-runner-xl font-bold mb-1">{{ t('cadence.title') }}</h1>
      <p style="color: #8A8A8A;" class="text-runner-sm">180步频黄金法则，让音乐节奏与步频完美同步</p>
    </div>

    <!-- SPM Control -->
    <div class="runner-card mb-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-runner-base">{{ t('cadence.targetSPM') }}</h3>
        <div class="text-runner-2xl font-bold font-mono" style="color: #E53935;">{{ store.targetSPM }}</div>
      </div>
      <div class="flex gap-2 mb-4">
        <button
          v-for="spm in store.presets" :key="spm"
          class="flex-1 py-2.5 rounded-runner text-runner-sm font-semibold transition-all duration-200 cursor-pointer"
          :style="store.targetSPM === spm
            ? { background: 'linear-gradient(135deg, #E53935, #FF5252)', color: 'white', boxShadow: '0 4px 14px rgba(229,57,53,0.25)' }
            : { background: '#F5F5F5', color: '#4A4A4A' }"
          @click="store.targetSPM = spm"
        >{{ spm }}</button>
      </div>
      <input v-model.number="store.targetSPM" type="range" min="120" max="220" class="w-full" />
      <div class="flex justify-between text-runner-xs mt-1" style="color: #8A8A8A;">
        <span>120</span><span>220 SPM</span>
      </div>
    </div>

    <!-- Mode Selection -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('cadence.mode') }}</h3>
      <div class="space-y-2">
        <button
          v-for="m in modes" :key="m.key"
          class="w-full flex items-center gap-3 p-3 rounded-runner transition-all duration-200 cursor-pointer text-left border-2"
          :style="store.mode === m.key
            ? { background: 'rgba(229,57,53,0.06)', borderColor: '#E53935' }
            : { background: '#F5F5F5', borderColor: 'transparent' }"
          @click="store.mode = m.key"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
            :style="store.mode === m.key ? { background: '#E53935', color: 'white' } : { background: '#E8E8E8', color: '#8A8A8A' }">
            <font-awesome-icon :icon="m.icon" class="text-sm" />
          </div>
          <div>
            <p class="font-semibold text-runner-sm" :style="{ color: store.mode === m.key ? '#E53935' : '#1A1A1A' }">{{ m.label }}</p>
            <p class="text-runner-xs" style="color: #8A8A8A;">{{ m.desc }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Beat Sound -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('cadence.beatSound') }}</h3>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="s in sounds" :key="s.key"
          class="flex flex-col items-center gap-1.5 py-3 rounded-runner transition-all duration-200 cursor-pointer border-2"
          :style="store.beatSound === s.key
            ? { background: 'rgba(229,57,53,0.06)', borderColor: '#E53935' }
            : { background: '#F5F5F5', borderColor: 'transparent' }"
          @click="store.beatSound = s.key"
        >
          <font-awesome-icon :icon="s.icon" class="text-xl" :style="{ color: store.beatSound === s.key ? '#E53935' : '#8A8A8A' }" />
          <span class="text-runner-xs font-medium" :style="{ color: store.beatSound === s.key ? '#E53935' : '#4A4A4A' }">{{ s.label }}</span>
        </button>
      </div>
    </div>

    <!-- Start/Stop -->
    <button
      class="w-full py-4 rounded-runner-xl text-runner-lg font-bold transition-all duration-200 cursor-pointer active:scale-95 border-2"
      :style="store.isActive
        ? { background: '#F5F5F5', color: '#E53935', borderColor: '#E53935' }
        : { background: 'linear-gradient(135deg, #E53935, #FF5252)', color: 'white', borderColor: 'transparent', boxShadow: '0 4px 14px rgba(229,57,53,0.25)' }"
      @click="store.isActive = !store.isActive"
    >
      <font-awesome-icon :icon="store.isActive ? 'fa-stop' : 'fa-play'" class="text-xl mr-2" />
      {{ store.isActive ? t('cadence.stop') : t('cadence.start') }}
    </button>
  </div>
</template>
