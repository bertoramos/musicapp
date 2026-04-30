import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { db } from '../db/database';
import type { Song } from '../types';
import { parseProgression } from '../lib/chords';
import { emptyPattern, playProgression } from '../lib/audio';
import { ChordPalette } from '../components/ChordPalette';
import { Progression } from '../components/Progression';
import { InstrumentPicker } from '../components/InstrumentPicker';
import { DrumGrid } from '../components/DrumGrid';
import type { Mode, Root } from '../lib/keys';
import type { DrumPattern, InstrumentId } from '../types';

export function SongEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    if (!id) return;
    db.songs.get(Number(id)).then((s) => setSong(s ?? null));
  }, [id]);

  function update<K extends keyof Song>(key: K, value: Song[K]) {
    if (!song) return;
    const updated = { ...song, [key]: value, updatedAt: Date.now() };
    setSong(updated);
    db.songs.put(updated);
  }

  // Cada item de la progresión necesita un id estable para dnd-kit aunque haya acordes repetidos.
  const idCounter = useRef(0);
  const items = useMemo(() => {
    return parseProgression(song?.chords ?? '').map((chord) => ({
      id: `c-${idCounter.current++}`,
      chord,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.chords]);

  function saveItems(next: { id: string; chord: string }[]) {
    update('chords', next.map((i) => i.chord).join(' | '));
  }

  function appendChord(chord: string) {
    if (!song) return;
    saveItems([...items, { id: `c-${idCounter.current++}`, chord }]);
  }

  function removeItem(id: string) {
    saveItems(items.filter((i) => i.id !== id));
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // Drag desde la paleta -> añadir al final
    if (activeId.startsWith('palette-')) {
      const chord = active.data.current?.chord as string | undefined;
      if (chord) appendChord(chord);
      return;
    }

    // Reordenar dentro de la progresión
    if (activeId !== overId) {
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex = items.findIndex((i) => i.id === overId);
      if (oldIndex >= 0 && newIndex >= 0) {
        saveItems(arrayMove(items, oldIndex, newIndex));
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  async function remove() {
    if (!song?.id) return;
    if (!confirm('¿Borrar esta canción?')) return;
    await db.songs.delete(song.id);
    navigate('/');
  }

  if (!song) return <div className="p-4 text-slate-400">Cargando…</div>;

  const chords = items.map((i) => i.chord);
  const root = (song.key || 'C') as Root;
  const mode: Mode = song.mode ?? 'major';
  const instrument: InstrumentId = song.instrument ?? 'synth';
  const drums: DrumPattern = song.drums ?? emptyPattern();
  const bpm = song.bpm ?? 90;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-indigo-400 hover:underline">
          ← Volver
        </button>
        <button onClick={remove} className="text-red-400 hover:underline text-sm">
          Borrar
        </button>
      </header>

      <input
        value={song.title}
        onChange={(e) => update('title', e.target.value)}
        placeholder="Título"
        className="w-full text-2xl font-bold bg-transparent border-b border-slate-700 focus:outline-none focus:border-indigo-500 py-2"
      />

      <InstrumentPicker
        value={instrument}
        onChange={(id) => update('instrument', id)}
        previewChord={root + (mode === 'minor' ? 'm' : '')}
      />

      <ChordPalette
        songKey={root}
        mode={mode}
        instrument={instrument}
        onKeyChange={(k) => update('key', k)}
        onModeChange={(m) => update('mode', m)}
        onAddChord={appendChord}
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-slate-400">Progresión</label>
          <button
            onClick={() => saveItems([])}
            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            Limpiar
          </button>
        </div>
        <Progression items={items} instrument={instrument} onRemove={removeItem} />
        {chords.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => playProgression(chords, bpm, instrument)}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              ▶ Reproducir progresión
            </button>
            <label className="text-sm text-slate-400 flex items-center gap-1">
              BPM
              <input
                type="number"
                value={bpm}
                onChange={(e) => update('bpm', Number(e.target.value) || undefined)}
                className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800"
              />
            </label>
          </div>
        )}
      </div>

      <DrumGrid
        pattern={drums}
        bpm={bpm}
        onChange={(p) => update('drums', p)}
      />

      <div>
        <label className="text-sm text-slate-400">Letra / notas</label>
        <textarea
          value={song.lyrics}
          onChange={(e) => update('lyrics', e.target.value)}
          rows={12}
          placeholder="Escribe la letra, ideas, estructura..."
          className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-800 font-mono leading-relaxed"
        />
      </div>
    </div>
    </DndContext>
  );
}
