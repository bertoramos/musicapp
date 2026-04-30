# MusicApp

PWA para hacer borradores de canciones, letras y progresiones de acordes.
Funciona offline e instalable en Android desde Chrome.

## Stack

- Vite + React + TypeScript
- TailwindCSS
- Dexie.js (IndexedDB) para guardar canciones en el dispositivo
- Tone.js para reproducir acordes
- vite-plugin-pwa para instalación + offline

## Pasos para usarla

### 1. Instalar dependencias

```bash
npm install
```

### 2. Desarrollar en local

```bash
npm run dev
```

Abre http://localhost:5173 en el navegador. Cambios en caliente.

### 3. Iconos PWA (importante)

Crea dos PNG y ponlos en `public/`:
- `public/icon-192.png` (192x192 px)
- `public/icon-512.png` (512x512 px)

Si no, la PWA no será instalable. Puedes generarlos en https://realfavicongenerator.net o con cualquier editor.

### 4. Build de producción

```bash
npm run build
npm run preview   # prueba el build local
```

### 5. Desplegar en GitHub Pages

1. Crea un repo en GitHub llamado `musicapp` y haz push.
2. En el repo: **Settings → Pages → Source: GitHub Actions**.
3. Haz push a `main`. El workflow `.github/workflows/deploy.yml` lo desplegará.
4. Estará en `https://TU_USUARIO.github.io/musicapp/`.

> Si cambias el nombre del repo, actualiza `base` en `vite.config.ts`.

### 6. Instalar en Android

1. Abre la URL en Chrome (Android).
2. Menú (⋮) → **Instalar app** o "Añadir a pantalla de inicio".
3. Se abre como app nativa, sin barra del navegador, offline, con icono.

## Datos del usuario

Todo se guarda en IndexedDB en el propio dispositivo (`navigator.storage.persist()` solicita persistencia). No hay servidor.

Para hacer **backup**, exporta canciones manualmente (futura mejora: botón export/import JSON).

## Próximas mejoras sugeridas

- Diagramas SVG de acordes (guitarra/piano).
- Metrónomo y grabación de voz con `MediaRecorder`.
- Export/import JSON para backup.
- Etiquetas y búsqueda.
- Transposición de progresiones.
