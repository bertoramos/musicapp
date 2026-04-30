import { useState } from 'react';
import {
  ALL_ROOTS,
  type Mode,
  type Root,
  diatonicChords,
  chromaticPalette,
  familyColor,
} from '../lib/keys';
import { playChord } from '../lib/audio';

interface Props {
  songKey: string;       // "C", "A"...
  mode: Mode;
  onKeyChange: (k: Root) => void;
  onModeChange: (m: Mode) => void;
  onAddChord: (chord: string) => void;
}

export function ChordPalette({ songKey, mode, onKeyChange, onModeChange, onAddChord }: Props) {
  const [showAll, setShowAll] = useState(false);
  const root = (ALL_ROOTS.includes(songKey as Root) ? songKey : 'C') as Root;
  const diatonic = diatonicChords(root, mode);
  const all = chromaticPalette(root, mode);

  const handlePlay = (name: string) => playChord(name);
  const handleAdd = (name: string) => {
    onAddChord(name);
    playChord(name);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-slate-400">Tonalidad</label>
        <select
          value={root}
          onChange={(e) => onKeyChange(e.target.value as Root)}
          className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
        >
          {ALL_ROOTS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as Mode)}
          className="px-2 py-1 rounded bg-slate-900 border border-slate-700"
        >
          <option value="major">mayor</option>
          <option value="minor">menor</option>
        </select>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="ml-auto text-sm px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
        >
          {showAll ? 'Solo diatónicos' : 'Mostrar todos'}
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Toca un acorde para oírlo y añadirlo a la progresión. Verde = tónica, azul = subdominante, rojo = dominante.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {diatonic.map((c) => (
          <button
            key={c.roman}
            onClick={() => handleAdd(c.name)}
            onContextMenu={(e) => { e.preventDefault(); handlePlay(c.name); }}
            className={`p-2 rounded-lg border text-left text-white transition ${familyColor(c.family)}`}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold">{c.name}</span>
              <span className="text-xs opacity-80">{c.roman}</span>
            </div>
            <div className="text-[10px] leading-tight opacity-90 mt-0.5">{c.fn}</div>
          </button>
        ))}
      </div>

      {showAll && (
        <div>
          <div className="text-xs text-slate-400 mb-1">Acordes fuera de la tonalidad</div>
          <div className="flex flex-wrap gap-1.5">
            {all.filter((c) => !c.diatonic).map((c) => (
              <button
                key={c.name}
                onClick={() => handleAdd(c.name)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
