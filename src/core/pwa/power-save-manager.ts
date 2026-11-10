class PowerSaveManager {
  private enabled = false;

  enable(): void {
    this.enabled = true;
    document.documentElement.classList.add('power-save');
  }

  disable(): void {
    this.enabled = false;
    document.documentElement.classList.remove('power-save');
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): void {
    if (this.enabled) this.disable();
    else this.enable();
  }
}

export const powerSaveManager = new PowerSaveManager();
