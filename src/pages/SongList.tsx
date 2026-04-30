import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function SongList() {
  const songs = useLiveQuery(() => db.songs.orderBy('updatedAt').reverse().toArray(), []);

  async function createSong() {
    const now = Date.now();
    const id = await db.songs.add({
      title: 'Nueva canción',
      lyrics: '',
      chords: '',
      createdAt: now,
      updatedAt: now,
    });
    window.location.hash = `#/song/${id}`;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mis canciones</h1>
        <button
          onClick={createSong}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          + Nueva
        </button>
      </header>

      {!songs && <p className="text-slate-400">Cargando…</p>}
      {songs && songs.length === 0 && (
        <p className="text-slate-400">Aún no tienes borradores. Crea el primero.</p>
      )}

      <ul className="space-y-2">
        {songs?.map((s) => (
          <li key={s.id}>
            <Link
              to={`/song/${s.id}`}
              className="block p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800"
            >
              <div className="font-medium">{s.title || '(sin título)'}</div>
              <div className="text-xs text-slate-400">
                {s.chords || '—'} · {new Date(s.updatedAt).toLocaleString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
