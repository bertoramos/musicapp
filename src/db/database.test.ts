import { describe, it, expect, beforeEach } from 'vitest';
import { MusicDB } from './database';

describe('MusicDB', () => {
  let db: MusicDB;

  beforeEach(() => {
    db = new MusicDB();
  });

  it('should have songs table', () => {
    expect(db.songs).toBeDefined();
  });

  it('should be able to add a song', async () => {
    const song = {
      title: 'Test Song',
      artist: 'Test Artist',
      key: 'C',
      tempo: 120,
      progression: [],
      updatedAt: Date.now()
    };
    
    // @ts-ignore - Dexie might need actual storage in tests but we check structure
    const id = await db.songs.add(song);
    expect(id).toBeDefined();
    
    const retrieved = await db.songs.get(id as number);
    expect(retrieved?.title).toBe('Test Song');
  });
});
