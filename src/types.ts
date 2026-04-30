export interface Song {
  id?: number;
  title: string;
  lyrics: string;        // letra en formato libre o ChordPro
  chords: string;        // progresión: "Am | F | C | G"
  key?: string;          // tonalidad: "C", "A", "F#"...
  mode?: 'major' | 'minor';
  bpm?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
