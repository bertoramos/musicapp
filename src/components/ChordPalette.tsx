import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  ALL_ROOTS,
  type Mode,
  type Root,
  diatonicChords,
  chromaticPalette,
  familyColor,
  type DiatonicChord,
} from '../lib/keys';
import { playChord } from '../lib/audio';

import type { InstrumentId } from '../types';

interface Props {
  songKey: string;       // "C", "A"...
  mode: Mode;
  instrument: InstrumentId;
  onKeyChange: (k: Root) => void;
  onModeChange: (m: Mode) => void;
  onAddChord: (chord: string) => void;
}

export function ChordPalette({ songKey, mode, instrument, onKeyChange, onModeChange, onAddChord }: Props) {
  const [showAll, setShowAll] = useState(false);
  const root = (ALL_ROOTS.includes(songKey as Root) ? songKey : 'C') as Root;
  const diatonic = diatonicChords(root, mode);
  const all = chromaticPalette(root, mode);

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
        Toca para añadir y oír · arrastra a la progresión · verde = tónica · azul = subdominante · rojo = dominante.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {diatonic.map((c) => (
          <DiatonicCard key={c.roman} chord={c} instrument={instrument} onAdd={onAddChord} />
        ))}
      </div>

      {showAll && (
        <div>
          <div className="text-xs text-slate-400 mb-1">Acordes fuera de la tonalidad</div>
          <div className="flex flex-wrap gap-1.5">
            {all.filter((c) => !c.diatonic).map((c) => (
              <ChromaticChip key={c.name} name={c.name} instrument={instrument} onAdd={onAddChord} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DiatonicCard({ chord, instrument, onAdd }: { chord: DiatonicChord; instrument: InstrumentId; onAdd: (n: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${chord.name}-${chord.roman}`,
    data: { chord: chord.name },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => { onAdd(chord.name); playChord(chord.name, instrument); }}
      className={`p-2 rounded-lg border text-left text-white transition cursor-grab active:cursor-grabbing touch-none select-none ${familyColor(chord.family)}`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-bold">{chord.name}</span>
        <span className="text-xs opacity-80">{chord.roman}</span>
      </div>
      <div className="text-[10px] leading-tight opacity-90 mt-0.5">{chord.fn}</div>
    </div>
  );
}

function ChromaticChip({ name, instrument, onAdd }: { name: string; instrument: InstrumentId; onAdd: (n: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-chrom-${name}`,
    data: { chord: name },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => { onAdd(name); playChord(name, instrument); }}
      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm cursor-grab active:cursor-grabbing touch-none select-none"
    >
      {name}
    </div>
  );
}
