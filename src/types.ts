export interface Song {
  id?: number;
  title: string;
  lyrics: string;        // letra en formato libre o ChordPro
  chords: string;        // progresión: "Am | F | C | G"
  key?: string;          // tonalidad: "C", "Am"...
  bpm?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
