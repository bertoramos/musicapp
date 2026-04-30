import { playChord } from '../lib/audio';

interface Props {
  chords: string[];
}

export function ChordPlayer({ chords }: Props) {
  if (chords.length === 0) {
    return <p className="text-slate-400 text-sm">Escribe acordes separados por "|" para verlos aquí.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {chords.map((c, i) => (
        <button
          key={i}
          onClick={() => playChord(c)}
          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium shadow"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
