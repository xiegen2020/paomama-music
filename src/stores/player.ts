import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Song } from '@/core/types';

export type PlayMode = 'sequential' | 'loop' | 'shuffle';

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<Song | null>(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(0.8);
  const playbackRate = ref(1.0);
  const playMode = ref<PlayMode>('sequential');
  const playlist = ref<Song[]>([]);
  const currentIndex = ref(-1);

  const progress = computed(() => duration.value > 0 ? currentTime.value / duration.value : 0);

  function setPlaylist(songs: Song[], startIndex = 0) {
    playlist.value = songs;
    currentIndex.value = startIndex;
    if (songs.length > 0) currentSong.value = songs[startIndex]!;
  }

  return { currentSong, isPlaying, currentTime, duration, volume, playbackRate, playMode, playlist, currentIndex, progress, setPlaylist };
});
