import type { AudioClip, TimelineProject, ChapterMark } from '@/core/types';

class EditorService {
  private project: TimelineProject | null = null;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private maxUndoSteps = 50;

  createProject(name: string): TimelineProject {
    this.project = {
      id: crypto.randomUUID(),
      name,
      tracks: [{ id: crypto.randomUUID(), name: '音轨1', clips: [], volume: 1, muted: false }],
      duration: 0,
      marks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return this.project;
  }

  getProject(): TimelineProject | null {
    return this.project;
  }

  private saveUndoState(): void {
    if (!this.project) return;
    this.undoStack.push(JSON.stringify(this.project));
    if (this.undoStack.length > this.maxUndoSteps) this.undoStack.shift();
    this.redoStack = [];
  }

  async addClip(trackId: string, clip: Omit<AudioClip, 'id'>): Promise<AudioClip> {
    this.saveUndoState();
    const track = this.project?.tracks.find(t => t.id === trackId);
    if (!track) throw new Error('音轨不存在');
    const newClip: AudioClip = { ...clip, id: crypto.randomUUID() };
    track.clips.push(newClip);
    this.recalculateDuration();
    return newClip;
  }

  async removeClip(clipId: string): Promise<void> {
    this.saveUndoState();
    for (const track of this.project?.tracks ?? []) {
      const idx = track.clips.findIndex(c => c.id === clipId);
      if (idx >= 0) {
        track.clips.splice(idx, 1);
        break;
      }
    }
    this.recalculateDuration();
  }

  async moveClip(clipId: string, newStartTime: number): Promise<void> {
    this.saveUndoState();
    for (const track of this.project?.tracks ?? []) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) { clip.startTime = newStartTime; break; }
    }
  }

  async splitClip(clipId: string, splitTime: number): Promise<[AudioClip, AudioClip] | null> {
    this.saveUndoState();
    for (const track of this.project?.tracks ?? []) {
      const clip = track.clips.find(c => c.id === clipId);
      if (!clip) continue;
      if (splitTime <= clip.startTime || splitTime >= clip.startTime + clip.duration) return null;
      const relativeTime = splitTime - clip.startTime;
      const clipA: AudioClip = { ...clip, id: crypto.randomUUID(), duration: relativeTime };
      const clipB: AudioClip = { ...clip, id: crypto.randomUUID(), startTime: splitTime, offset: clip.offset + relativeTime, duration: clip.duration - relativeTime };
      const idx = track.clips.indexOf(clip);
      track.clips.splice(idx, 1, clipA, clipB);
      return [clipA, clipB];
    }
    return null;
  }

  async addChapterMark(time: number, label: string): Promise<ChapterMark> {
    const mark: ChapterMark = { id: crypto.randomUUID(), time, label, color: '#ff4757' };
    this.project?.marks.push(mark);
    return mark;
  }

  async undo(): Promise<void> {
    if (this.undoStack.length === 0 || !this.project) return;
    this.redoStack.push(JSON.stringify(this.project));
    this.project = JSON.parse(this.undoStack.pop()!);
  }

  async redo(): Promise<void> {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(JSON.stringify(this.project));
    this.project = JSON.parse(this.redoStack.pop()!);
  }

  private recalculateDuration(): void {
    if (!this.project) return;
    let maxEnd = 0;
    for (const track of this.project.tracks) {
      for (const clip of track.clips) {
        const end = clip.startTime + clip.duration;
        if (end > maxEnd) maxEnd = end;
      }
    }
    this.project.duration = maxEnd;
    this.project.updatedAt = Date.now();
  }
}

export const editorService = new EditorService();
