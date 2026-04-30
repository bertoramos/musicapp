import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';
import { requestPersistentStorage } from './db/database';
import { unlockAudioOnFirstGesture } from './lib/audio';

requestPersistentStorage();
unlockAudioOnFirstGesture();

// Registra el service worker para que sea PWA instalable y funcione offline.
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
