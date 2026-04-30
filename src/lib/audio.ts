import * as Tone from 'tone';
import { chordNotes, parseChord } from './chords';
import type { DrumPattern, DrumTrack, InstrumentId } from '../types';

// =============================================================================
// Desbloqueo del AudioContext en móvil (requiere gesto del usuario).
// =============================================================================

let unlocked = false;

export function unlockAudioOnFirstGesture() {
  const handler = async () => {
    if (unlocked) return;
    try {
      await Tone.start();
      const ctx = Tone.getContext().rawContext;
      if (ctx.state !== 'running') {
        await (ctx as AudioContext).resume();
      }
      unlocked = true;
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', handler);
    } catch (e) {
      console.warn('Audio unlock failed', e);
    }
  };
  window.addEventListener('touchstart', handler, { passive: true });
  window.addEventListener('mousedown', handler);
  window.addEventListener('keydown', handler);
}

// =============================================================================
// Instrumentos: cada uno es una PolySynth distinta. Lazy-init.
// Sintetizado con Tone.js (sin dependencia de samples externos).
// =============================================================================

export const INSTRUMENTS: { id: InstrumentId; label: string; emoji: string }[] = [
  { id: 'synth',   label: 'Sintetizador', emoji: '🎹' },
  { id: 'piano',   label: 'Piano',        emoji: '🎼' },
  { id: 'guitar',  label: 'Guitarra',     emoji: '🎸' },
  { id: 'organ',   label: 'Órgano',       emoji: '⛪' },
  { id: 'marimba', label: 'Marimba',      emoji: '🪵' },
];

const instrumentCache = new Map<InstrumentId, Tone.PolySynth>();

function buildInstrument(id: InstrumentId): Tone.PolySynth {
  let poly: Tone.PolySynth;
  switch (id) {
    case 'piano':
      // FMSynth da un timbre tipo Rhodes/piano eléctrico.
      poly = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2,
        modulationIndex: 6,
        envelope: { attack: 0.005, decay: 1.2, sustain: 0.1, release: 1.5 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.5 },
      });
      poly.volume.value = -10;
      break;
    case 'guitar': {
      // Sintetizador "plucky" con sawtooth + decay corto.
      poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.6, sustain: 0.0, release: 0.8 },
      });
      const filter = new Tone.Filter({ frequency: 1800, type: 'lowpass', Q: 1 });
      poly.chain(filter, Tone.getDestination());
      poly.volume.value = -14;
      return poly;
    }
    case 'organ':
      // Órgano: square sostenido, sin decay.
      poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.02, decay: 0.0, sustain: 1.0, release: 0.3 },
      });
      poly.volume.value = -18;
      break;
    case 'marimba':
      // Marimba: senoidal con ataque y release muy cortos, golpe percusivo.
      poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.0, release: 0.6 },
      });
      poly.volume.value = -8;
      break;
    case 'synth':
    default:
      poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 1.2 },
      });
      poly.volume.value = -8;
      break;
  }
  poly.toDestination();
  return poly;
}

function getInstrument(id: InstrumentId = 'synth'): Tone.PolySynth {
  let inst = instrumentCache.get(id);
  if (!inst) {
    inst = buildInstrument(id);
    instrumentCache.set(id, inst);
  }
  return inst;
}

// =============================================================================
// Reproducción de acordes y progresiones.
// =============================================================================

export async function playChord(raw: string, instrument: InstrumentId = 'synth', durationSec = 1.2) {
  const parsed = parseChord(raw);
  if (!parsed) return;
  await Tone.start();
  const notes = chordNotes(parsed);
  getInstrument(instrument).triggerAttackRelease(notes, durationSec);
}

export async function playProgression(chords: string[], bpm = 80, instrument: InstrumentId = 'synth') {
  if (chords.length === 0) return;
  await Tone.start();
  const beatSec = 60 / bpm;
  const chordDur = beatSec * 2;
  const s = getInstrument(instrument);
  const now = Tone.now();
  chords.forEach((raw, i) => {
    const parsed = parseChord(raw);
    if (!parsed) return;
    s.triggerAttackRelease(chordNotes(parsed), chordDur * 0.95, now + i * chordDur);
  });
}

// =============================================================================
// Batería sintetizada + secuenciador de pasos.
// =============================================================================

interface DrumKit {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  hihat: Tone.MetalSynth;
  clap: Tone.NoiseSynth;
}

let drumKit: DrumKit | null = null;

function getDrumKit(): DrumKit {
  if (drumKit) return drumKit;
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
  }).toDestination();
  kick.volume.value = -4;

  const snareFilter = new Tone.Filter({ frequency: 1500, type: 'highpass' }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  });
  snare.connect(snareFilter);
  snare.volume.value = -10;

  const hihat = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.08, release: 0.05 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();
  hihat.volume.value = -22;

  const clapFilter = new Tone.Filter({ frequency: 1200, type: 'bandpass', Q: 1.2 }).toDestination();
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.22, sustain: 0 },
  });
  clap.connect(clapFilter);
  clap.volume.value = -12;

  drumKit = { kick, snare, hihat, clap };
  return drumKit;
}

export const STEPS = 16;

export function emptyPattern(): DrumPattern {
  return {
    kick:  Array(STEPS).fill(false),
    snare: Array(STEPS).fill(false),
    hihat: Array(STEPS).fill(false),
    clap:  Array(STEPS).fill(false),
  };
}

let drumLoop: Tone.Loop | null = null;
let stepCallback: ((step: number) => void) | null = null;
// Patrón vivo, mutable; se actualiza desde fuera para que el loop refleje cambios al instante.
const livePattern: DrumPattern = emptyPattern();

function triggerDrum(track: DrumTrack, time: number) {
  const kit = getDrumKit();
  switch (track) {
    case 'kick':  kit.kick.triggerAttackRelease('C2', '8n', time); break;
    case 'snare': kit.snare.triggerAttackRelease('16n', time); break;
    case 'hihat': kit.hihat.triggerAttackRelease('32n', time, 0.4); break;
    case 'clap':  kit.clap.triggerAttackRelease('16n', time); break;
  }
}

export function previewDrum(track: DrumTrack) {
  Tone.start();
  triggerDrum(track, Tone.now());
}

export function setDrumPattern(p: DrumPattern) {
  (Object.keys(livePattern) as DrumTrack[]).forEach((k) => {
    livePattern[k] = p[k] ?? Array(STEPS).fill(false);
  });
}

export function setStepCallback(cb: ((step: number) => void) | null) {
  stepCallback = cb;
}

export async function startDrumLoop(bpm = 90) {
  await Tone.start();
  Tone.getTransport().bpm.value = bpm;
  if (drumLoop) {
    drumLoop.dispose();
    drumLoop = null;
  }
  let step = 0;
  drumLoop = new Tone.Loop((time) => {
    (Object.keys(livePattern) as DrumTrack[]).forEach((track) => {
      if (livePattern[track][step]) triggerDrum(track, time);
    });
    if (stepCallback) {
      const s = step;
      Tone.getDraw().schedule(() => stepCallback?.(s), time);
    }
    step = (step + 1) % STEPS;
  }, '16n');
  drumLoop.start(0);
  Tone.getTransport().start();
}

export function stopDrumLoop() {
  if (drumLoop) {
    drumLoop.dispose();
    drumLoop = null;
  }
  Tone.getTransport().stop();
  if (stepCallback) stepCallback(-1);
}

export function setBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}
