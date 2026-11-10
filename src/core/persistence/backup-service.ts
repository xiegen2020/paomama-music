class BackupService {
  async exportBackup(password?: string): Promise<Blob> {
    const db = await (await import('./db-schema')).dbManager.getDB();
    const data = {
      version: '1.0.0',
      exportedAt: Date.now(),
      playlists: await db.getAll('playlists'),
      reminderConfigs: await db.getAll('reminderConfigs'),
      preferences: await db.getAll('preferences'),
    };
    const json = JSON.stringify(data);
    if (password) {
      const encrypted = await this.encrypt(new TextEncoder().encode(json), password);
      return new Blob([encrypted], { type: 'application/octet-stream' });
    }
    return new Blob([json], { type: 'application/json' });
  }

  async importBackup(file: File, password?: string): Promise<any> {
    const buffer = await file.arrayBuffer();
    let json: string;
    if (password) {
      const decrypted = await this.decrypt(buffer, password);
      json = new TextDecoder().decode(decrypted);
    } else {
      json = new TextDecoder().decode(buffer);
    }
    return JSON.parse(json);
  }

  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }

  private async encrypt(data: Uint8Array, password: string): Promise<ArrayBuffer> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    return result.buffer;
  }

  private async decrypt(data: ArrayBuffer, password: string): Promise<ArrayBuffer> {
    const arr = new Uint8Array(data);
    const salt = arr.slice(0, 16);
    const iv = arr.slice(16, 28);
    const encrypted = arr.slice(28);
    const key = await this.deriveKey(password, salt);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  }
}

export const backupService = new BackupService();
