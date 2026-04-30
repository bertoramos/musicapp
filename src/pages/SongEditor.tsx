import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/database';
import type { Song } from '../types';
import { parseProgression } from '../lib/chords';
import { playProgression } from '../lib/audio';
import { ChordPlayer } from '../components/ChordPlayer';
import { ChordPalette } from '../components/ChordPalette';
import type { Mode, Root } from '../lib/keys';

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

  function appendChord(chord: string) {
    if (!song) return;
    const sep = song.chords.trim().length === 0 ? '' : ' | ';
    update('chords', song.chords + sep + chord);
  }

  function removeLastChord() {
    if (!song) return;
    const list = parseProgression(song.chords);
    list.pop();
    update('chords', list.join(' | '));
  }

  async function remove() {
    if (!song?.id) return;
    if (!confirm('¿Borrar esta canción?')) return;
    await db.songs.delete(song.id);
    navigate('/');
  }

  if (!song) return <div className="p-4 text-slate-400">Cargando…</div>;

  const chords = parseProgression(song.chords);
  const root = (song.key || 'C') as Root;
  const mode: Mode = song.mode ?? 'major';

  return (
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

      <ChordPalette
        songKey={root}
        mode={mode}
        onKeyChange={(k) => update('key', k)}
        onModeChange={(m) => update('mode', m)}
        onAddChord={appendChord}
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-slate-400">Progresión</label>
          <div className="flex gap-2">
            <button
              onClick={removeLastChord}
              className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
            >
              ← Quitar último
            </button>
            <button
              onClick={() => update('chords', '')}
              className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
            >
              Limpiar
            </button>
          </div>
        </div>
        <input
          value={song.chords}
          onChange={(e) => update('chords', e.target.value)}
          placeholder="Am | F | C | G"
          className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 font-mono"
        />
        <div className="mt-3 space-y-2">
          <ChordPlayer chords={chords} />
          {chords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => playProgression(chords, song.bpm ?? 80)}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
              >
                ▶ Reproducir progresión
              </button>
              <label className="text-sm text-slate-400 flex items-center gap-1">
                BPM
                <input
                  type="number"
                  value={song.bpm ?? 80}
                  onChange={(e) => update('bpm', Number(e.target.value) || undefined)}
                  className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800"
                />
              </label>
            </div>
          )}
        </div>
      </div>

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
  );
}
