<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useReminderStore } from '@/stores/reminder';
const { t } = useI18n();
const store = useReminderStore();
const presets = [
  { key: 'marathon3h', label: '全马3小时', pace: '4:15/km', time: '3:00:00', color: '#E53935', icon: 'fa-trophy' },
  { key: 'marathon4h', label: '全马4小时', pace: '5:41/km', time: '4:00:00', color: '#FF6D00', icon: 'fa-medal' },
  { key: 'marathon5h', label: '全马5小时', pace: '7:06/km', time: '5:00:00', color: '#00C853', icon: 'fa-award' },
  { key: 'halfMarathon2h', label: '半马2小时', pace: '5:41/km', time: '2:00:00', color: '#E53935', icon: 'fa-trophy' },
];
</script>

<template>
  <div class="runner-section animate-slide-up">
    <div class="mb-6">
      <h1 class="text-runner-xl font-bold mb-1">{{ t('reminder.title') }}</h1>
      <p style="color: #8A8A8A;" class="text-runner-sm">基于时间的智能提醒，比赛日不再大脑缺氧</p>
    </div>

    <!-- Preset Templates -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('reminder.preset') }}</h3>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="p in presets" :key="p.key"
          class="p-3 rounded-runner text-left transition-all duration-200 cursor-pointer border-2"
          :style="store.activePreset === p.key
            ? { borderColor: p.color, background: p.color + '12' }
            : { borderColor: '#E8E8E8', background: '#F5F5F5' }"
          @click="store.activePreset = p.key"
        >
          <div class="flex items-center gap-2 mb-1">
            <font-awesome-icon :icon="p.icon" class="text-sm" :style="{ color: p.color }" />
            <span class="font-semibold text-runner-sm" :style="{ color: store.activePreset === p.key ? p.color : '#1A1A1A' }">{{ p.label }}</span>
          </div>
          <div class="flex items-center gap-2 text-runner-xs" style="color: #8A8A8A;">
            <span>{{ p.pace }}</span>
            <span>·</span>
            <span>{{ p.time }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Pace Plan -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('reminder.pacePlan') }}</h3>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-runner-xs font-medium mb-1.5 block" style="color: #8A8A8A;">目标配速</label>
          <input v-model="store.targetPace" class="runner-input" placeholder="5:41" />
        </div>
        <div>
          <label class="text-runner-xs font-medium mb-1.5 block" style="color: #8A8A8A;">目标距离(km)</label>
          <input v-model.number="store.targetDistance" type="number" class="runner-input" step="0.1" />
        </div>
      </div>
    </div>

    <!-- Fuel Plan -->
    <div class="runner-card mb-4">
      <h3 class="font-semibold text-runner-base mb-3">{{ t('reminder.fuelPlan') }}</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F0F0F0;">
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="fa-droplet" class="text-lg" style="color: #42A5F5;" />
            <span class="text-runner-sm" style="color: #1A1A1A;">补水提醒</span>
          </div>
          <span class="text-runner-sm font-mono" style="color: #8A8A8A;">每45分钟</span>
        </div>
        <div class="flex items-center justify-between py-2">
          <div class="flex items-center gap-2">
            <font-awesome-icon icon="fa-bolt" class="text-lg" style="color: #FF6D00;" />
            <span class="text-runner-sm" style="color: #1A1A1A;">能量胶提醒</span>
          </div>
          <span class="text-runner-sm font-mono" style="color: #8A8A8A;">每30分钟</span>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <button class="runner-btn-primary w-full py-3 text-runner-lg">
      <font-awesome-icon icon="fa-play" class="text-xl mr-2" />
      {{ t('reminder.addReminder') }}
    </button>
  </div>
</template>
