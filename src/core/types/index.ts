// ===== 音频与曲库 =====
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverArt: Blob | null;
  duration: number;
  bpm: number | null;
  format: string;
  bitrate: number;
  fileSize: number;
  audioBlobId: string;
  addedAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ===== 格式转换 =====
export type EncryptedFormat = 'ncm' | 'qmc' | 'mflac' | 'kgm' | 'kwm';
export type OutputFormat = 'mp3' | 'aac' | 'ogg' | 'wav';

export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  coverArt: Blob | null;
}

export interface DecodeResult {
  audioData: ArrayBuffer;
  format: string;
  metadata: AudioMetadata;
}

export interface EncodeOptions {
  format: OutputFormat;
  bitrate: number;
  sampleRate: number;
  channels: number;
}

// ===== 步频节拍器 =====
export type CadenceMode = 'follow' | 'force' | 'gradient' | 'overlay' | 'replace';
export type BeatSound = 'woodblock' | 'drum' | 'electronic' | 'voice';
export type VisualFeedback = 'flash' | 'pendulum' | 'waveform';

export interface CadenceConfig {
  targetSPM: number;
  mode: CadenceMode;
  beatSound: BeatSound;
  beatVolume: number;
  visualFeedbacks: VisualFeedback[];
  gradientDuration?: number;
  voiceLanguage?: 'zh' | 'en';
}

// ===== 马拉松剪辑器 =====
export interface AudioClip {
  id: string;
  trackId: string;
  sourceId: string;
  startTime: number;
  duration: number;
  offset: number;
  volume: number;
  bpm: number;
  fadeIn: number;
  fadeOut: number;
  crossfade: CrossfadeConfig;
  chapterMark?: ChapterMark;
}

export interface CrossfadeConfig {
  duration: number;
  curve: 'linear' | 'sine' | 'exponential';
}

export interface ChapterMark {
  id: string;
  time: number;
  label: string;
  color: string;
}

export interface TimelineTrack {
  id: string;
  name: string;
  clips: AudioClip[];
  volume: number;
  muted: boolean;
}

export interface TimelineProject {
  id: string;
  name: string;
  tracks: TimelineTrack[];
  duration: number;
  marks: ChapterMark[];
  createdAt: number;
  updatedAt: number;
}

// ===== 智能提醒 =====
export type ReminderType = 'timeNode' | 'pace' | 'fuel' | 'musicAction';
export type ReminderActionType = 'voice' | 'notification' | 'vibrate' | 'volumeChange' | 'songSwitch' | 'bpmChange';

export interface ReminderActionConfig {
  type: ReminderActionType;
  message?: string;
  language?: 'zh' | 'en';
  targetVolume?: number;
  transitionDuration?: number;
  targetSongId?: string;
  targetBPM?: number;
  bpmTransitionDuration?: number;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  triggerTime: number;
  repeatInterval?: number;
  actions: ReminderActionConfig[];
  enabled: boolean;
  triggered: boolean;
}

// ===== 配速计算 =====
export interface PacePlan {
  targetPace: number;
  targetDistance: number;
  totalTime: number;
  kmMarkers: KmMarker[];
  halfWayMarker: TimeMarker;
  finishMarker: TimeMarker;
}

export interface KmMarker {
  km: number;
  time: number;
  message: string;
}

export interface TimeMarker {
  time: number;
  message: string;
}

// ===== 马拉松预设 =====
export interface MarathonPreset {
  id: string;
  name: string;
  totalTime: number;
  pacePerKm: number;
  fuelInterval: number;
  markers: PresetMarker[];
}

export interface PresetMarker {
  time: number;
  message: string;
  type: string;
}

// ===== 能量曲线 =====
export interface EnergyCurve {
  points: { time: number; energy: number }[];
}

// ===== 事件 =====
export interface AppEvents {
  'player:timeUpdate': { time: number; duration: number };
  'player:songChange': { song: Song };
  'player:stateChange': { playing: boolean };
  'cadence:beat': { time: number; beat: number; spm: number };
  'cadence:spmChange': { spm: number };
  'reminder:trigger': { reminder: Reminder };
  'reminder:elapsed': { elapsed: number };
  'library:songAdded': { song: Song };
  'library:songRemoved': { songId: string };
  'editor:projectChange': { project: TimelineProject };
  'app:online': void;
  'app:offline': void;
  'app:powerSave': { enabled: boolean };
}
