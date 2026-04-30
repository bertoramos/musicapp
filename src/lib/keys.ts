// Utilidades de tonalidad: acordes diatónicos, grados romanos y función armónica.

export type Mode = 'major' | 'minor';

export const ALL_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type Root = typeof ALL_ROOTS[number];

const NOTE_TO_SEMI: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};
const SEMI_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Grados diatónicos: intervalos en semitonos y calidad de cada acorde.
const MAJOR_DEGREES = [
  { semi: 0,  quality: '',    roman: 'I',    family: 'tonic',       fn: 'Tónica (reposo)' },
  { semi: 2,  quality: 'm',   roman: 'ii',   family: 'subdominant', fn: 'Supertónica (preparación)' },
  { semi: 4,  quality: 'm',   roman: 'iii',  family: 'tonic',       fn: 'Mediante (color)' },
  { semi: 5,  quality: '',    roman: 'IV',   family: 'subdominant', fn: 'Subdominante (movimiento)' },
  { semi: 7,  quality: '',    roman: 'V',    family: 'dominant',    fn: 'Dominante (tensión)' },
  { semi: 9,  quality: 'm',   roman: 'vi',   family: 'tonic',       fn: 'Relativa menor' },
  { semi: 11, quality: 'dim', roman: 'vii°', family: 'dominant',    fn: 'Sensible (tensión)' },
] as const;

const MINOR_DEGREES = [
  { semi: 0,  quality: 'm',   roman: 'i',    family: 'tonic',       fn: 'Tónica (reposo)' },
  { semi: 2,  quality: 'dim', roman: 'ii°',  family: 'subdominant', fn: 'Supertónica (tensión)' },
  { semi: 3,  quality: '',    roman: 'III',  family: 'tonic',       fn: 'Relativa mayor' },
  { semi: 5,  quality: 'm',   roman: 'iv',   family: 'subdominant', fn: 'Subdominante' },
  { semi: 7,  quality: '',    roman: 'V',    family: 'dominant',    fn: 'Dominante (armónica)' },
  { semi: 8,  quality: '',    roman: 'VI',   family: 'tonic',       fn: 'Submediante' },
  { semi: 10, quality: '',    roman: 'VII',  family: 'subdominant', fn: 'Subtónica' },
] as const;

export type ChordFamily = 'tonic' | 'subdominant' | 'dominant' | 'chromatic';

export interface DiatonicChord {
  name: string;          // "C", "Dm", "G", ...
  roman: string;         // "I", "ii", ...
  family: ChordFamily;
  fn: string;            // descripción de la función
  degree: number;        // 1..7
}

export function diatonicChords(root: Root, mode: Mode): DiatonicChord[] {
  const rootSemi = NOTE_TO_SEMI[root];
  const degrees = mode === 'major' ? MAJOR_DEGREES : MINOR_DEGREES;
  return degrees.map((d, i) => {
    const noteName = SEMI_TO_NOTE[(rootSemi + d.semi) % 12];
    return {
      name: noteName + d.quality,
      roman: d.roman,
      family: d.family as ChordFamily,
      fn: d.fn,
      degree: i + 1,
    };
  });
}

// Devuelve los 12 acordes cromáticos (mayores y menores) marcando cuáles son diatónicos.
export interface PaletteChord {
  name: string;
  diatonic?: DiatonicChord;   // si forma parte de la tonalidad
}

export function chromaticPalette(root: Root, mode: Mode): PaletteChord[] {
  const diatonic = diatonicChords(root, mode);
  const byName = new Map(diatonic.map((d) => [d.name, d]));
  const result: PaletteChord[] = [];
  for (const note of ALL_ROOTS) {
    for (const q of ['', 'm']) {
      const name = note + q;
      result.push({ name, diatonic: byName.get(name) });
    }
  }
  return result;
}

export function familyColor(family: ChordFamily): string {
  switch (family) {
    case 'tonic':       return 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400';
    case 'subdominant': return 'bg-sky-600 hover:bg-sky-500 border-sky-400';
    case 'dominant':    return 'bg-rose-600 hover:bg-rose-500 border-rose-400';
    default:            return 'bg-slate-700 hover:bg-slate-600 border-slate-600';
  }
}
