import * as Tone from 'tone';
import { chordNotes, parseChord } from './chords';

let synth: Tone.PolySynth | null = null;

function getSynth() {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 1.2 },
    }).toDestination();
    synth.volume.value = -8;
  }
  return synth;
}

export async function playChord(raw: string, durationSec = 1.2) {
  const parsed = parseChord(raw);
  if (!parsed) return;
  await Tone.start();
  const notes = chordNotes(parsed);
  getSynth().triggerAttackRelease(notes, durationSec);
}

export async function playProgression(chords: string[], bpm = 80) {
  if (chords.length === 0) return;
  await Tone.start();
  const beatSec = 60 / bpm;
  const chordDur = beatSec * 2; // 2 tiempos por acorde
  const s = getSynth();
  const now = Tone.now();
  chords.forEach((raw, i) => {
    const parsed = parseChord(raw);
    if (!parsed) return;
    s.triggerAttackRelease(chordNotes(parsed), chordDur * 0.95, now + i * chordDur);
  });
}
