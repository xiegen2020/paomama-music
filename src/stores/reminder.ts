import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Reminder } from '@/core/types';

export const useReminderStore = defineStore('reminder', () => {
  const reminders = ref<Reminder[]>([]);
  const activePreset = ref<string | null>(null);
  const elapsed = ref(0);
  const isRunning = ref(false);
  const targetPace = ref('5:41'); // 秒/公里
  const targetDistance = ref(42.195); // 公里

  function addReminder(reminder: Reminder) {
    reminders.value.push(reminder);
  }

  function removeReminder(id: string) {
    reminders.value = reminders.value.filter(r => r.id !== id);
  }

  return { reminders, activePreset, elapsed, isRunning, targetPace, targetDistance, addReminder, removeReminder };
});
