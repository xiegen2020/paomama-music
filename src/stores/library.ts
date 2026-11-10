import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Song, Playlist } from '@/core/types';

export const useLibraryStore = defineStore('library', () => {
  const songs = ref<Song[]>([]);
  const playlists = ref<Playlist[]>([]);
  const searchQuery = ref('');
  const sortBy = ref<'title' | 'artist' | 'bpm' | 'duration'>('title');
  const sortOrder = ref<'asc' | 'desc'>('asc');

  const filteredSongs = computed(() => {
    let result = songs.value;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
    }
    return result;
  });

  return { songs, playlists, searchQuery, sortBy, sortOrder, filteredSongs };
});
