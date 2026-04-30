// Utilidades simples para acordes.
// Soporta acordes mayores y menores básicos: C, Cm, C#, Db, F#m, etc.

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

const SEMITONE_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface ParsedChord {
  root: string;
  quality: 'maj' | 'min' | 'dim' | 'aug' | '7' | 'maj7' | 'min7';
  raw: string;
}

export function parseChord(raw: string): ParsedChord | null {
  const m = raw.trim().match(/^([A-G][#b]?)(maj7|min7|m7|dim|aug|7|m)?$/);
  if (!m) return null;
  const root = m[1].replace('b', 'b');
  let quality: ParsedChord['quality'] = 'maj';
  switch (m[2]) {
    case 'm': quality = 'min'; break;
    case 'm7': quality = 'min7'; break;
    case 'maj7': quality = 'maj7'; break;
    case '7': quality = '7'; break;
    case 'dim': quality = 'dim'; break;
    case 'aug': quality = 'aug'; break;
    case 'min7': quality = 'min7'; break;
  }
  return { root, quality, raw };
}

// Devuelve las notas (con octava) de un acorde para reproducirlo con Tone.js.
export function chordNotes(chord: ParsedChord, octave = 4): string[] {
  const rootSemi = NOTE_TO_SEMITONE[chord.root];
  if (rootSemi === undefined) return [];
  let intervals: number[] = [0, 4, 7]; // mayor por defecto
  switch (chord.quality) {
    case 'min': intervals = [0, 3, 7]; break;
    case 'dim': intervals = [0, 3, 6]; break;
    case 'aug': intervals = [0, 4, 8]; break;
    case '7':   intervals = [0, 4, 7, 10]; break;
    case 'maj7':intervals = [0, 4, 7, 11]; break;
    case 'min7':intervals = [0, 3, 7, 10]; break;
  }
  return intervals.map((semi) => {
    const total = rootSemi + semi;
    const note = SEMITONE_TO_NOTE[total % 12];
    const oct = octave + Math.floor(total / 12);
    return `${note}${oct}`;
  });
}

// Parsea una progresión: "Am | F | C | G" -> ["Am","F","C","G"]
export function parseProgression(text: string): string[] {
  return text.split(/[|,\n]/).map((s) => s.trim()).filter(Boolean);
}
