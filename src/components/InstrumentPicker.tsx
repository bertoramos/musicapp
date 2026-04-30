import { INSTRUMENTS, playChord } from '../lib/audio';
import type { InstrumentId } from '../types';

interface Props {
  value: InstrumentId;
  onChange: (id: InstrumentId) => void;
  previewChord?: string; // acorde a sonar al cambiar (por defecto C mayor)
}

export function InstrumentPicker({ value, onChange, previewChord = 'C' }: Props) {
  return (
    <div>
      <div className="text-sm text-slate-400 mb-1">Instrumento</div>
      <div className="flex flex-wrap gap-2">
        {INSTRUMENTS.map((inst) => {
          const active = inst.id === value;
          return (
            <button
              key={inst.id}
              onClick={() => {
                onChange(inst.id);
                playChord(previewChord, inst.id, 0.8);
              }}
              className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition ${
                active
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{inst.emoji}</span>
              <span>{inst.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
