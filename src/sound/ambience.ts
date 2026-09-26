import { getSettings, subscribeSettings } from "@/game/settings";
import { onAudioReady, runningEngine, type AudioEngine } from "./engine";

// Generative background sound, synthesized live so it never repeats exactly: slow pad chords,
// wind moving through a filter, a faint power-line hum and the odd high note. It plays while
// the setting is on, audio is unlocked and the tab is visible.

const SESSION_VOLUME = 0.6;
const FADE_IN = 3;
const FADE_OUT = 1.5;

// A new chord every CHORD_EVERY seconds, each lasting CHORD_LENGTH, so they overlap.
const CHORD_EVERY = 8;
const CHORD_LENGTH = 11;
const PAD_VOICE_VOLUME = 0.02;

// Warm, unresolved chords (Hz) around C major; the next one is picked at random.
const CHORDS = [
  [174.61, 220, 261.63, 329.63], // Fmaj7
  [130.81, 196, 246.94, 329.63], // Cmaj7
  [110, 220, 261.63, 392], // Am7
  [146.83, 174.61, 220, 329.63], // Dm9
  [98, 196, 261.63, 293.66], // Gsus
];
const SPARKLE_NOTES = [1046.5, 1174.66, 1318.51, 1567.98, 1760]; // C6 D6 E6 G6 A6

type Session = { stop: () => void };

let session: Session | null = null;

function sync() {
  const engine = runningEngine();
  const shouldPlay = engine !== null && getSettings().ambience && !document.hidden;
  if (shouldPlay && !session) session = startSession(engine);
  if (!shouldPlay && session) {
    session.stop();
    session = null;
  }
}

export function startAmbienceController() {
  subscribeSettings(sync);
  onAudioReady(sync);
  document.addEventListener("visibilitychange", sync);
}

function startSession({ context, ambience }: AudioEngine): Session {
  // Everything in a session goes through its own gain, so stopping fades it all out at once
  // even though pad notes are scheduled seconds ahead.
  const output = new GainNode(context, { gain: 0 });
  output.connect(ambience);
  output.gain.linearRampToValueAtTime(SESSION_VOLUME, context.currentTime + FADE_IN);

  const sources = [...startWind(context, output), ...startHum(context, output)];

  let nextChordAt = context.currentTime + 0.5;
  let nextSparkleAt = context.currentTime + randomBetween(6, 12);
  let chord = randomItem(CHORDS);
  const schedule = () => {
    const horizon = context.currentTime + 1;
    while (nextChordAt < horizon) {
      playChord(context, output, chord, nextChordAt);
      chord = randomItem(CHORDS.filter((candidate) => candidate !== chord));
      nextChordAt += CHORD_EVERY;
    }
    if (nextSparkleAt < horizon) {
      playSparkle(context, output, nextSparkleAt);
      nextSparkleAt += randomBetween(6, 14);
    }
  };
  schedule();
  const timer = setInterval(schedule, 500);

  return {
    stop() {
      clearInterval(timer);
      const now = context.currentTime;
      output.gain.cancelScheduledValues(now);
      output.gain.setValueAtTime(output.gain.value, now);
      output.gain.linearRampToValueAtTime(0, now + FADE_OUT);
      setTimeout(
        () => {
          for (const source of sources) source.stop();
          output.disconnect();
        },
        (FADE_OUT + 0.1) * 1000,
      );
    },
  };
}

// White noise through a band-pass filter whose centre drifts slowly, like gusts of wind.
function startWind(context: AudioContext, output: AudioNode): AudioScheduledSourceNode[] {
  const length = context.sampleRate * 4;
  const buffer = new AudioBuffer({ length, sampleRate: context.sampleRate });
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;

  const noise = new AudioBufferSourceNode(context, { buffer, loop: true });
  const filter = new BiquadFilterNode(context, { type: "bandpass", frequency: 450, Q: 0.7 });
  const drift = new OscillatorNode(context, { frequency: 0.06 });
  const driftDepth = new GainNode(context, { gain: 250 });
  const level = new GainNode(context, { gain: 0.07 });

  drift.connect(driftDepth).connect(filter.frequency);
  noise.connect(filter).connect(level).connect(output);
  noise.start();
  drift.start();
  return [noise, drift];
}

// Mains hum (Korea runs at 60 Hz, so the hum sits at 120 Hz), barely there and wavering.
function startHum(context: AudioContext, output: AudioNode): AudioScheduledSourceNode[] {
  const hum = new OscillatorNode(context, { frequency: 120 });
  const level = new GainNode(context, { gain: 0.006 });
  const waver = new OscillatorNode(context, { frequency: 0.2 });
  const waverDepth = new GainNode(context, { gain: 0.003 });

  waver.connect(waverDepth).connect(level.gain);
  hum.connect(level).connect(output);
  hum.start();
  waver.start();
  return [hum, waver];
}

// Each chord tone is two slightly detuned oscillators under a low-pass filter, swelling in
// and out slowly.
function playChord(context: AudioContext, output: AudioNode, chord: number[], start: number) {
  const end = start + CHORD_LENGTH;
  const filter = new BiquadFilterNode(context, { type: "lowpass", frequency: 900, Q: 0.3 });
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(1, start + 3.5);
  envelope.gain.setValueAtTime(1, end - 4);
  envelope.gain.linearRampToValueAtTime(0, end);
  filter.connect(envelope).connect(output);

  for (const frequency of chord) {
    for (const [type, detune] of [
      ["sine", -4],
      ["triangle", 4],
    ] as const) {
      const oscillator = new OscillatorNode(context, { type, frequency, detune });
      const level = new GainNode(context, { gain: PAD_VOICE_VOLUME });
      oscillator.connect(level).connect(filter);
      oscillator.start(start);
      oscillator.stop(end);
    }
  }
}

// A quiet high note now and then, like a distant bell or bird.
function playSparkle(context: AudioContext, output: AudioNode, start: number) {
  const oscillator = new OscillatorNode(context, { frequency: randomItem(SPARKLE_NOTES) });
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(0.018, start + 0.02);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + 1.6);
  oscillator.connect(envelope).connect(output);
  oscillator.start(start);
  oscillator.stop(start + 1.7);
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

function randomItem<T>(items: T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) throw new Error("randomItem needs at least one item");
  return item;
}
