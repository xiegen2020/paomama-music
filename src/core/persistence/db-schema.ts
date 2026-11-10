import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'paomama';
const DB_VERSION = 1;

interface PaoMaMaDB {
  songs: any;
  songAudio: any;
  playlists: any;
  editorProjects: any;
  reminderConfigs: any;
  preferences: any;
}

class DatabaseManager {
  private db: IDBPDatabase<PaoMaMaDB> | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB<PaoMaMaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('songs')) {
          const songStore = db.createObjectStore('songs', { keyPath: 'id' });
          songStore.createIndex('title', 'title');
          songStore.createIndex('artist', 'artist');
          songStore.createIndex('bpm', 'bpm');
          songStore.createIndex('addedAt', 'addedAt');
        }
        if (!db.objectStoreNames.contains('songAudio')) {
          db.createObjectStore('songAudio', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('playlists')) {
          const plStore = db.createObjectStore('playlists', { keyPath: 'id' });
          plStore.createIndex('name', 'name');
        }
        if (!db.objectStoreNames.contains('editorProjects')) {
          const epStore = db.createObjectStore('editorProjects', { keyPath: 'id' });
          epStore.createIndex('updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('reminderConfigs')) {
          const rcStore = db.createObjectStore('reminderConfigs', { keyPath: 'id' });
          rcStore.createIndex('presetId', 'presetId');
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
      },
    });
  }

  async getDB(): Promise<IDBPDatabase<PaoMaMaDB>> {
    if (!this.db) await this.initialize();
    return this.db!;
  }

  async checkStorageQuota(): Promise<{ usage: number; quota: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
    }
    return { usage: 0, quota: 0 };
  }

  async onStoragePressure(): Promise<boolean> {
    const { usage, quota } = await this.checkStorageQuota();
    return quota > 0 && usage / quota > 0.9;
  }
}

export const dbManager = new DatabaseManager();
