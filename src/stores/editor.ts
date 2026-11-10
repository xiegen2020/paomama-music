import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TimelineProject } from '@/core/types';

export const useEditorStore = defineStore('editor', () => {
  const project = ref<TimelineProject | null>(null);
  const selectedClipId = ref<string | null>(null);
  const zoomLevel = ref(1);
  const playheadPosition = ref(0);
  const isPlaying = ref(false);

  return { project, selectedClipId, zoomLevel, playheadPosition, isPlaying };
});
