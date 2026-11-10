<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const features = [
  { icon: 'fa-file-audio', title: '格式转换', desc: 'NCM/QMC/KGM一键解密', color: '#E53935', path: '/converter' },
  { icon: 'fa-stopwatch', title: '步频节拍器', desc: '180SPM黄金步频', color: '#FF6D00', path: '/cadence' },
  { icon: 'fa-pen-to-square', title: '马拉松剪辑', desc: '智能拼接跑步音乐', color: '#00C853', path: '/editor' },
  { icon: 'fa-bell', title: '配速提醒', desc: '时间节点语音播报', color: '#E53935', path: '/reminder' },
];

const paceItems = [
  { label: '轻松跑', spm: '170', pace: '6:00', color: '#00C853' },
  { label: '马拉松配速', spm: '180', pace: '5:20', color: '#E53935' },
  { label: '乳酸阈值', spm: '185', pace: '4:40', color: '#FF6D00' },
  { label: '间歇跑', spm: '190', pace: '4:00', color: '#E53935' },
];
</script>

<template>
  <div class="animate-fade-in">
    <!-- Hero Section -->
    <section class="px-4 pt-10 pb-8">
      <div class="relative overflow-hidden rounded-runner-xl p-8" style="background: linear-gradient(135deg, #E53935, #FF5252);">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style="background: white; filter: blur(40px); transform: translate(30%, -30%);" />
        <div class="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style="background: white; filter: blur(30px); transform: translate(-20%, 20%);" />

        <div class="relative z-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <span class="text-white font-bold text-xl">跑</span>
            </div>
          </div>
          <h1 class="text-white text-runner-2xl font-bold tracking-tight mb-2">{{ t('app.name') }}</h1>
          <p class="text-white/80 text-runner-lg mb-6">{{ t('app.slogan') }}</p>
          <div class="flex gap-3">
            <router-link to="/library" class="inline-flex items-center gap-2 px-6 py-3 rounded-runner bg-white font-semibold transition-all hover:shadow-lg active:scale-95 no-underline" style="color: #E53935;">
              <font-awesome-icon icon="fa-music" class="text-lg" />
              开始使用
            </router-link>
            <router-link to="/reminder" class="inline-flex items-center gap-2 px-6 py-3 rounded-runner bg-white/15 text-white font-semibold backdrop-blur-sm border border-white/20 transition-all hover:bg-white/25 active:scale-95 no-underline">
              <font-awesome-icon icon="fa-bell" class="text-lg" />
              比赛模式
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Cards -->
    <section class="px-4 pb-6">
      <h2 class="text-runner-lg font-bold mb-4" style="color: #1A1A1A;">核心功能</h2>
      <div class="grid grid-cols-2 gap-3">
        <router-link
          v-for="f in features" :key="f.path"
          :to="f.path"
          class="runner-card flex flex-col items-start gap-3 no-underline hover:translate-y--0.5 transition-all duration-200"
          style="color: #1A1A1A;"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: f.color + '12' }">
            <font-awesome-icon :icon="f.icon" class="text-xl" :style="{ color: f.color }" />
          </div>
          <div>
            <p class="font-semibold text-runner-base mb-0.5">{{ f.title }}</p>
            <p class="text-runner-sm" style="color: #8A8A8A;">{{ f.desc }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="px-4 pb-6">
      <div class="runner-card">
        <h3 class="font-semibold text-runner-base mb-3" style="color: #1A1A1A;">步频-配速参考</h3>
        <div class="space-y-2">
          <div v-for="item in paceItems" :key="item.label" class="flex items-center justify-between py-2 border-b last:border-b-0" style="border-color: #F0F0F0;">
            <div class="flex items-center gap-2">
              <font-awesome-icon icon="fa-circle" class="text-xs" :style="{ color: item.color }" />
              <span class="text-runner-sm font-medium" style="color: #1A1A1A;">{{ item.label }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="runner-badge-primary text-runner-xs">{{ item.spm }} SPM</span>
              <span class="text-runner-sm font-mono" style="color: #8A8A8A;">{{ item.pace }}/km</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
