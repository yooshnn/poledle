import { getSettings } from "@/game/settings";
import { runningEngine } from "./engine";

// Short synthesized sound effects for game actions. Nothing is downloaded.

export type Effect = "select" | "wrong" | "correct" | "lose" | "record" | "tick";

// Note frequencies (Hz).
const C4 = 261.63;
const E_FLAT_4 = 311.13;
const G4 = 392;
const B_FLAT_3 = 233.08;
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.51;

type Note = {
  frequency: number;
  // Seconds after the effect starts.
  at?: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
  // Slides to this frequency over the note.
  glideTo?: number;
};

const EFFECTS: Record<Effect, Note[]> = {
  // A soft "tok" when a cell is picked.
  select: [{ frequency: 1250, glideTo: 700, duration: 0.06, volume: 0.12, type: "triangle" }],
  // Two falling notes.
  wrong: [
    { frequency: E_FLAT_4, duration: 0.14, volume: 0.2, type: "triangle" },
    { frequency: B_FLAT_3, at: 0.12, duration: 0.24, volume: 0.2, type: "triangle" },
  ],
  // A rising major chime.
  correct: [
    { frequency: C5, duration: 0.45, volume: 0.16 },
    { frequency: E5, at: 0.07, duration: 0.45, volume: 0.16 },
    { frequency: G5, at: 0.14, duration: 0.5, volume: 0.16 },
    { frequency: C6, at: 0.21, duration: 0.7, volume: 0.07 },
  ],
  // A slow falling minor line when a game or run is lost.
  lose: [
    { frequency: G4, duration: 0.32, volume: 0.15, type: "triangle" },
    { frequency: E_FLAT_4, at: 0.2, duration: 0.32, volume: 0.15, type: "triangle" },
    { frequency: C4, at: 0.4, duration: 0.8, volume: 0.15, type: "triangle" },
  ],
  // A run that beats the best score.
  record: [C5, E5, G5, C6, E6].map((frequency, index) => ({
    frequency,
    at: index * 0.06,
    duration: index === 4 ? 0.9 : 0.4,
    volume: 0.14,
  })),
  // The last seconds of a round.
  tick: [{ frequency: 1760, duration: 0.03, volume: 0.06 }],
};

// The sound for a submitted guess, by the game status it led to.
export function guessEffect(status: "playing" | "won" | "lost"): Effect {
  if (status === "won") return "correct";
  return status === "lost" ? "lose" : "wrong";
}

export function playEffect(effect: Effect) {
  const engine = runningEngine();
  if (!engine || !getSettings().effects) return;
  const start = engine.context.currentTime + 0.01;
  for (const note of EFFECTS[effect]) playNote(engine.context, engine.effects, start, note);
}

function playNote(
  context: AudioContext,
  output: AudioNode,
  start: number,
  { frequency, at = 0, duration, volume, type = "sine", glideTo }: Note,
) {
  const begin = start + at;
  const end = begin + duration;
  const oscillator = new OscillatorNode(context, { type, frequency });
  if (glideTo) {
    oscillator.frequency.setValueAtTime(frequency, begin);
    oscillator.frequency.exponentialRampToValueAtTime(glideTo, end);
  }

  // Quick attack, exponential decay: a plucked, bell-like envelope without clicks.
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.setValueAtTime(0, begin);
  envelope.gain.linearRampToValueAtTime(volume, begin + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(envelope).connect(output);
  oscillator.start(begin);
  oscillator.stop(end + 0.05);
}
