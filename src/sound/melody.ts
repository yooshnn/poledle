// A sparse marimba line in C major pentatonic. Two-bar phrases run motif, answer (the motif
// with its last two notes moved), a second motif, then two bars of rest. Every 16 bars the
// motifs are written anew.

// C5 D5 E5 G5 A5 C6 (Hz).
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
// Eighth-note slots in a phrase.
const SLOTS = 16;
// Chance of a note on a slot; beats are more likely than off-beats.
const BEAT_CHANCE = 0.45;
const OFF_BEAT_CHANCE = 0.12;
const PHRASE_BARS = 2;
const REWRITE_BARS = 16;
const VOLUME = 0.03;

// A scale index per slot, or null for a rest.
type Phrase = (number | null)[];

export type Melody = { phrases: Phrase[] };

export function createMelody(): Melody {
  return { phrases: writePhrases() };
}

// Plays the note, if any, on this sixteenth step. Notes on beats 1 and 3 are nudged onto a tone
// of the current chord.
export function playMelodyStep(
  melody: Melody,
  context: AudioContext,
  output: AudioNode,
  bar: number,
  step: number,
  chord: readonly number[],
  time: number,
) {
  if (step === 0 && bar > 0 && bar % REWRITE_BARS === 0) melody.phrases = writePhrases();
  if (step % 2 !== 0) return;
  const phrase = melody.phrases[Math.floor(bar / PHRASE_BARS) % 4];
  const slot = (bar % PHRASE_BARS) * 8 + step / 2;
  const index = phrase?.[slot];
  if (index === null || index === undefined) return;
  const onBeat = slot % 4 === 0;
  const frequency = SCALE[onBeat ? fitToChord(index, chord) : index] ?? 0;
  marimba(context, output, frequency, time, onBeat ? 1 : 0.75);
}

function writePhrases(): Phrase[] {
  const motif = writeMotif();
  return [
    motif,
    answer(motif),
    writeMotif(),
    Array.from<number | null>({ length: SLOTS }).fill(null),
  ];
}

// A random walk over the scale in small steps, with rests.
function writeMotif(): Phrase {
  const phrase: Phrase = [];
  let index = 1 + Math.floor(Math.random() * 3);
  for (let slot = 0; slot < SLOTS; slot++) {
    const chance = slot % 4 === 0 ? BEAT_CHANCE : OFF_BEAT_CHANCE;
    // The last slot stays empty so phrases breathe.
    if (slot === SLOTS - 1 || Math.random() > chance) {
      phrase.push(null);
      continue;
    }
    index = clampIndex(index + randomItem([-2, -1, -1, 0, 1, 1, 2]));
    phrase.push(index);
  }
  if (!phrase.some((note) => note !== null)) phrase[0] = 2;
  return phrase;
}

function answer(motif: Phrase): Phrase {
  const phrase = [...motif];
  const played = phrase.flatMap((note, slot) => (note === null ? [] : [slot]));
  for (const slot of played.slice(-2)) {
    phrase[slot] = clampIndex((phrase[slot] ?? 0) + randomItem([-2, -1, 1, 2]));
  }
  return phrase;
}

// The nearest scale index whose pitch class is in the chord.
function fitToChord(index: number, chord: readonly number[]): number {
  const classes = new Set(chord.map(pitchClass));
  for (const offset of [0, 1, -1, 2, -2]) {
    const candidate = SCALE[index + offset];
    if (candidate !== undefined && classes.has(pitchClass(candidate))) return index + offset;
  }
  return index;
}

const pitchClass = (frequency: number) => {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  return ((midi % 12) + 12) % 12;
};

const clampIndex = (index: number) => Math.max(0, Math.min(SCALE.length - 1, index));

// A sine body with a brief overtone two octaves up for the mallet strike.
function marimba(
  context: AudioContext,
  output: AudioNode,
  frequency: number,
  time: number,
  accent: number,
) {
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.setValueAtTime(0, time);
  envelope.gain.linearRampToValueAtTime(VOLUME * accent, time + 0.004);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.55);
  envelope.connect(output);

  const body = new OscillatorNode(context, { frequency });
  const strike = new OscillatorNode(context, { frequency: frequency * 4 });
  const strikeLevel = new GainNode(context, { gain: 0.35 });
  strikeLevel.gain.setValueAtTime(0.35, time);
  strikeLevel.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
  body.connect(envelope);
  strike.connect(strikeLevel).connect(envelope);
  for (const oscillator of [body, strike]) {
    oscillator.start(time);
    oscillator.stop(time + 0.6);
  }
}

function randomItem<T>(items: T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) throw new Error("randomItem needs at least one item");
  return item;
}
