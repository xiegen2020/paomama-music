import type { Song, Playlist } from '@/core/types';
import { dbManager } from '@/core/persistence/db-schema';

class LibraryService {
  async importFiles(files: File[], onProgress?: (done: number, total: number) => void): Promise<Song[]> {
    const db = await dbManager.getDB();
    const songs: Song[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const id = crypto.randomUUID();
      const audioBlob = await file.arrayBuffer();

      // 存储音频Blob
      await db.put('songAudio', { id, blob: new Blob([audioBlob]) });

      const song: Song = {
        id,
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: '',
        album: '',
        coverArt: null,
        duration: 0,
        bpm: null,
        format: file.name.split('.').pop() ?? '',
        bitrate: 0,
        fileSize: file.size,
        audioBlobId: id,
        addedAt: Date.now(),
      };

      await db.put('songs', song);
      songs.push(song);
      onProgress?.(i + 1, files.length);
    }

    return songs;
  }

  async getAllSongs(): Promise<Song[]> {
    const db = await dbManager.getDB();
    return db.getAll('songs');
  }

  async getSong(id: string): Promise<Song | undefined> {
    const db = await dbManager.getDB();
    return db.get('songs', id);
  }

  async deleteSong(id: string): Promise<void> {
    const db = await dbManager.getDB();
    await db.delete('songs', id);
    await db.delete('songAudio', id);
  }

  async updateSongMetadata(id: string, updates: Partial<Song>): Promise<void> {
    const db = await dbManager.getDB();
    const song = await db.get('songs', id);
    if (song) {
      await db.put('songs', { ...song, ...updates });
    }
  }

  async createPlaylist(name: string): Promise<Playlist> {
    const db = await dbManager.getDB();
    const playlist: Playlist = { id: crypto.randomUUID(), name, songIds: [], createdAt: Date.now(), updatedAt: Date.now() };
    await db.put('playlists', playlist);
    return playlist;
  }

  async addToPlaylist(playlistId: string, songIds: string[]): Promise<void> {
    const db = await dbManager.getDB();
    const playlist = await db.get('playlists', playlistId);
    if (playlist) {
      playlist.songIds = [...new Set([...playlist.songIds, ...songIds])];
      playlist.updatedAt = Date.now();
      await db.put('playlists', playlist);
    }
  }

  async removeFromPlaylist(playlistId: string, songIds: string[]): Promise<void> {
    const db = await dbManager.getDB();
    const playlist = await db.get('playlists', playlistId);
    if (playlist) {
      playlist.songIds = playlist.songIds.filter((id: string) => !songIds.includes(id));
      playlist.updatedAt = Date.now();
      await db.put('playlists', playlist);
    }
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    const db = await dbManager.getDB();
    return db.getAll('playlists');
  }
}

export const libraryService = new LibraryService();
