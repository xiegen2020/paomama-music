import type { Reminder } from '@/core/types';

export class ReminderEngine {
  private reminders: Reminder[] = [];
  private lastTickTime = 0;

  addReminder(reminder: Reminder): void {
    this.reminders.push(reminder);
  }

  removeReminder(id: string): void {
    this.reminders = this.reminders.filter(r => r.id !== id);
  }

  updateReminder(id: string, updates: Partial<Reminder>): void {
    const idx = this.reminders.findIndex(r => r.id === id);
    if (idx >= 0) {
      this.reminders[idx] = { ...this.reminders[idx]!, ...updates };
    }
  }

  tick(currentTime: number): Reminder[] {
    const triggered: Reminder[] = [];
    if (currentTime <= this.lastTickTime) return triggered;
    this.lastTickTime = currentTime;

    for (const reminder of this.reminders) {
      if (!reminder.enabled || reminder.triggered) continue;
      if (currentTime >= reminder.triggerTime && currentTime < reminder.triggerTime + 1) {
        reminder.triggered = true;
        triggered.push(reminder);
        // 重复提醒
        if (reminder.repeatInterval) {
          this.addReminder({
            ...reminder,
            id: `${reminder.id}-${Date.now()}`,
            triggerTime: reminder.triggerTime + reminder.repeatInterval,
            triggered: false,
          });
        }
      }
    }
    return triggered;
  }

  getReminders(): Reminder[] {
    return [...this.reminders];
  }

  reset(): void {
    this.reminders.forEach(r => { r.triggered = false; });
    this.lastTickTime = 0;
  }
}

export const reminderEngine = new ReminderEngine();
