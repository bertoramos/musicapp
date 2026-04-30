export type InstrumentId = 'synth' | 'piano' | 'guitar' | 'organ' | 'marimba';

export type DrumTrack = 'kick' | 'snare' | 'hihat' | 'clap';

// 16 booleanos por pista (un compás de semicorcheas).
export type DrumPattern = Record<DrumTrack, boolean[]>;

export interface Song {
  id?: number;
  title: string;
  lyrics: string;        // letra en formato libre o ChordPro
  chords: string;        // progresión: "Am | F | C | G"
  key?: string;          // tonalidad: "C", "A", "F#"...
  mode?: 'major' | 'minor';
  bpm?: number;
  instrument?: InstrumentId;
  drums?: DrumPattern;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
