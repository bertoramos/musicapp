import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/database';
import type { Song } from '../types';
import { parseProgression } from '../lib/chords';
import { playProgression } from '../lib/audio';
import { ChordPlayer } from '../components/ChordPlayer';

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

  async function remove() {
    if (!song?.id) return;
    if (!confirm('¿Borrar esta canción?')) return;
    await db.songs.delete(song.id);
    navigate('/');
  }

  if (!song) return <div className="p-4 text-slate-400">Cargando…</div>;

  const chords = parseProgression(song.chords);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
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

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-slate-400">Tonalidad</span>
          <input
            value={song.key ?? ''}
            onChange={(e) => update('key', e.target.value)}
            placeholder="Ej: Am"
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-800"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-400">BPM</span>
          <input
            type="number"
            value={song.bpm ?? ''}
            onChange={(e) => update('bpm', Number(e.target.value) || undefined)}
            placeholder="80"
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-800"
          />
        </label>
      </div>

      <div>
        <label className="text-sm text-slate-400">Acordes / progresión</label>
        <input
          value={song.chords}
          onChange={(e) => update('chords', e.target.value)}
          placeholder="Am | F | C | G"
          className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-800 font-mono"
        />
        <div className="mt-3 space-y-2">
          <ChordPlayer chords={chords} />
          {chords.length > 0 && (
            <button
              onClick={() => playProgression(chords, song.bpm ?? 80)}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
            >
              ▶ Reproducir progresión
            </button>
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
