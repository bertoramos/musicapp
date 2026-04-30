import Dexie, { type Table } from 'dexie';
import type { Song } from '../types';

export class MusicDB extends Dexie {
  songs!: Table<Song, number>;

  constructor() {
    super('musicapp');
    this.version(1).stores({
      songs: '++id, title, updatedAt',
    });
  }
}

export const db = new MusicDB();

// Pide almacenamiento persistente para que el navegador no borre los datos.
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist();
    return granted;
  }
  return false;
}
