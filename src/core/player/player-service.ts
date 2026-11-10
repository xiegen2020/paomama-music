import type { Song } from '@/core/types';
import { audioEngine } from '@/core/audio/engine/audio-context-manager';

type PlayModeType = 'sequential' | 'loop' | 'shuffle';

class PlayerService {
  private playlist: Song[] = [];
  private currentIndex = -1;
  private playMode: PlayModeType = 'sequential';
  private isPlaying = false;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onSongChangeCallback: ((song: Song) => void) | null = null;
  private onStateChangeCallback: ((playing: boolean) => void) | null = null;
  private timeUpdateInterval: number | null = null;

  async play(song?: Song): Promise<void> {
    if (song) {
      const idx = this.playlist.findIndex(s => s.id === song.id);
      if (idx >= 0) this.currentIndex = idx;
    }
    if (this.currentIndex < 0 || this.playlist.length === 0) return;

    const current = this.playlist[this.currentIndex]!;
    const db = await (await import('@/core/persistence/db-schema')).dbManager.getDB();
    const audioData = await db.get('songAudio', current.audioBlobId);
    if (!audioData) return;

    const blob: Blob = audioData.blob;
    const arrayBuffer = await blob.arrayBuffer();

    await audioEngine.initialize();
    const ctx = audioEngine.getContext()!;
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    await audioEngine.playBuffer(audioBuffer);

    this.isPlaying = true;
    this.onSongChangeCallback?.(current);
    this.onStateChangeCallback?.(true);
    this.startTimeUpdate();
  }

  async pause(): Promise<void> {
    audioEngine.stop();
    this.isPlaying = false;
    this.onStateChangeCallback?.(false);
    this.stopTimeUpdate();
  }

  async togglePlay(): Promise<void> {
    if (this.isPlaying) await this.pause();
    else await this.play();
  }

  async next(): Promise<void> {
    if (this.playlist.length === 0) return;
    if (this.playMode === 'shuffle') {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }
    await this.play();
  }

  async prev(): Promise<void> {
    if (this.playlist.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    await this.play();
  }

  setVolume(volume: number): void {
    audioEngine.setVolume(volume);
  }

  setPlayMode(mode: PlayModeType): void {
    this.playMode = mode;
  }

  setPlaylist(songs: Song[], startIndex = 0): void {
    this.playlist = songs;
    this.currentIndex = startIndex;
  }

  onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }

  onSongChange(callback: (song: Song) => void): void {
    this.onSongChangeCallback = callback;
  }

  onPlayStateChange(callback: (playing: boolean) => void): void {
    this.onStateChangeCallback = callback;
  }

  getIsPlaying(): boolean { return this.isPlaying; }

  private startTimeUpdate(): void {
    this.stopTimeUpdate();
    this.timeUpdateInterval = window.setInterval(() => {
      this.onTimeUpdateCallback?.(audioEngine.getCurrentTime());
    }, 100);
  }

  private stopTimeUpdate(): void {
    if (this.timeUpdateInterval !== null) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }
}

export const playerService = new PlayerService();
