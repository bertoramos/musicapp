import { HashRouter, Route, Routes } from 'react-router-dom';
import { SongList } from './pages/SongList';
import { SongEditor } from './pages/SongEditor';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SongList />} />
        <Route path="/song/:id" element={<SongEditor />} />
      </Routes>
    </HashRouter>
  );
}
