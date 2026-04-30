import { useEffect, useState } from 'react';
import {
  STEPS,
  emptyPattern,
  previewDrum,
  setDrumPattern,
  setStepCallback,
  startDrumLoop,
  stopDrumLoop,
  setBpm,
} from '../lib/audio';
import type { DrumPattern, DrumTrack } from '../types';

interface Props {
  pattern: DrumPattern;
  bpm: number;
  onChange: (p: DrumPattern) => void;
}

const TRACKS: { id: DrumTrack; label: string; color: string }[] = [
  { id: 'kick',  label: 'Bombo',     color: 'bg-rose-500' },
  { id: 'snare', label: 'Caja',      color: 'bg-amber-500' },
  { id: 'hihat', label: 'Hi-hat',    color: 'bg-emerald-500' },
  { id: 'clap',  label: 'Palmas',    color: 'bg-sky-500' },
];

export function DrumGrid({ pattern, bpm, onChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  // Mantener el patrón vivo del motor de audio sincronizado.
  useEffect(() => {
    setDrumPattern(pattern);
  }, [pattern]);

  // Cambios de BPM se aplican al transport en directo.
  useEffect(() => {
    if (playing) setBpm(bpm);
  }, [bpm, playing]);

  // Limpieza al desmontar: parar el loop si quedó sonando.
  useEffect(() => {
    return () => {
      stopDrumLoop();
      setStepCallback(null);
    };
  }, []);

  function toggle(track: DrumTrack, step: number) {
    const next: DrumPattern = {
      ...pattern,
      [track]: pattern[track].map((v, i) => (i === step ? !v : v)),
    };
    onChange(next);
  }

  async function togglePlay() {
    if (playing) {
      stopDrumLoop();
      setStepCallback(null);
      setActiveStep(-1);
      setPlaying(false);
    } else {
      setStepCallback((s) => setActiveStep(s));
      await startDrumLoop(bpm);
      setPlaying(true);
    }
  }

  function clear() {
    onChange(emptyPattern());
  }

  const isEmpty = TRACKS.every((t) => pattern[t.id].every((v) => !v));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">Ritmo</div>
        <div className="flex gap-2">
          <button
            onClick={togglePlay}
            className={`text-xs px-3 py-1 rounded ${
              playing ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
            } text-white`}
          >
            {playing ? '■ Parar' : '▶ Play'}
          </button>
          <button
            onClick={clear}
            disabled={isEmpty}
            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {TRACKS.map((track) => (
            <div key={track.id} className="flex items-center gap-1 mb-1">
              <button
                onClick={() => previewDrum(track.id)}
                className="w-16 shrink-0 text-xs text-left px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Previsualizar"
              >
                {track.label}
              </button>
              <div className="flex gap-0.5">
                {Array.from({ length: STEPS }).map((_, i) => {
                  const on = pattern[track.id][i];
                  const isActive = activeStep === i;
                  const isBeat = i % 4 === 0; // marcas cada 4 pasos
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(track.id, i)}
                      className={`w-6 h-7 sm:w-7 sm:h-8 rounded transition ${
                        on
                          ? `${track.color} ${isActive ? 'ring-2 ring-white' : ''}`
                          : `${isBeat ? 'bg-slate-700' : 'bg-slate-800'} ${
                              isActive ? 'ring-2 ring-indigo-400' : ''
                            } hover:bg-slate-600`
                      }`}
                      aria-label={`${track.label} paso ${i + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        16 pasos por compás · marcas más oscuras cada negra · toca el nombre para oír el sonido.
      </p>
    </div>
  );
}
