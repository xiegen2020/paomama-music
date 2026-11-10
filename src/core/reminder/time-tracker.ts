export class TimeTracker {
  private startTime = 0;
  private pausedAt = 0;
  private isPaused = false;
  private isRunning = false;

  start(): void {
    this.startTime = performance.now();
    this.isRunning = true;
    this.isPaused = false;
    this.pausedAt = 0;
  }

  pause(): void {
    if (!this.isRunning || this.isPaused) return;
    this.pausedAt = performance.now();
    this.isPaused = true;
  }

  resume(): void {
    if (!this.isPaused) return;
    this.startTime += performance.now() - this.pausedAt;
    this.isPaused = false;
  }

  reset(): void {
    this.startTime = 0;
    this.pausedAt = 0;
    this.isPaused = false;
    this.isRunning = false;
  }

  getElapsed(): number {
    if (!this.isRunning) return 0;
    if (this.isPaused) return (this.pausedAt - this.startTime) / 1000;
    return (performance.now() - this.startTime) / 1000;
  }

  getElapsedMs(): number {
    return this.getElapsed() * 1000;
  }

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  formatPace(secondsPerKm: number): string {
    const min = Math.floor(secondsPerKm / 60);
    const sec = Math.floor(secondsPerKm % 60);
    return `${min}:${String(sec).padStart(2, '0')}/km`;
  }

  getIsRunning(): boolean { return this.isRunning; }
  getIsPaused(): boolean { return this.isPaused; }
}

export const timeTracker = new TimeTracker();
