// A small, sparse lo-fi kit under the pads. One bar is 16 sixteenth-note steps.

// Steps each drum plays on, per bar.
const KICK_STEPS = new Set([0, 10]);
const SNAP_STEPS = new Set([4, 12]);
const HAT_STEPS = new Set([0, 2, 4, 6, 8, 10, 12, 14]);
const OPEN_HAT_STEPS = new Set([14]);

// Play for 8 bars, then rest for 4.
const PLAY_BARS = 8;
const CYCLE_BARS = 12;

// Chance that a closed hat is replaced by a relay click.
const RELAY_CHANCE = 0.25;
// How far each hit's volume wanders at random.
const HUMANIZE = 0.15;

const KICK_VOLUME = 0.26;
const SNAP_VOLUME = 0.13;
const HAT_VOLUME = 0.048;
const RELAY_VOLUME = 0.024;

export type Kit = { context: AudioContext; output: AudioNode; noise: AudioBuffer };

export function playDrumStep(kit: Kit, bar: number, step: number, time: number) {
  if (bar % CYCLE_BARS >= PLAY_BARS) return;
  if (KICK_STEPS.has(step)) kick(kit, time, humanize(1));
  if (SNAP_STEPS.has(step)) snap(kit, time, humanize(1));
  if (OPEN_HAT_STEPS.has(step)) hat(kit, time, humanize(0.9), 0.22);
  else if (HAT_STEPS.has(step)) {
    if (Math.random() < RELAY_CHANCE) relay(kit, time, humanize(1));
    else hat(kit, time, humanize(step % 4 === 0 ? 1 : 0.7), 0.035);
  }
}

const humanize = (velocity: number) => velocity * (1 - HUMANIZE / 2 + Math.random() * HUMANIZE);

// A sine dropping in pitch.
function kick({ context, output }: Kit, time: number, velocity: number) {
  const oscillator = new OscillatorNode(context, { frequency: 120 });
  oscillator.frequency.setValueAtTime(120, time);
  oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.12);
  const envelope = decay(context, KICK_VOLUME * velocity, time, 0.38);
  oscillator.connect(envelope).connect(output);
  oscillator.start(time);
  oscillator.stop(time + 0.4);
}

// A short burst of band-passed noise.
function snap(kit: Kit, time: number, velocity: number) {
  noiseHit(
    kit,
    time,
    new BiquadFilterNode(kit.context, { type: "bandpass", frequency: 1800, Q: 0.9 }),
    SNAP_VOLUME * velocity,
    0.13,
  );
}

function hat(kit: Kit, time: number, velocity: number, length: number) {
  noiseHit(
    kit,
    time,
    new BiquadFilterNode(kit.context, { type: "highpass", frequency: 7000 }),
    HAT_VOLUME * velocity,
    length,
  );
}

// A relay pulling in on a pole: a very short square click with a little noise.
function relay(kit: Kit, time: number, velocity: number) {
  const { context, output } = kit;
  const oscillator = new OscillatorNode(context, { type: "square", frequency: 2300 });
  oscillator.connect(decay(context, RELAY_VOLUME * velocity, time, 0.012)).connect(output);
  oscillator.start(time);
  oscillator.stop(time + 0.02);
  hat(kit, time + 0.004, velocity * 0.5, 0.018);
}

function noiseHit(
  { context, output, noise }: Kit,
  time: number,
  filter: BiquadFilterNode,
  volume: number,
  length: number,
) {
  const source = new AudioBufferSourceNode(context, { buffer: noise });
  source
    .connect(filter)
    .connect(decay(context, volume, time, length))
    .connect(output);
  // A random offset so hits don't all sound the same.
  source.start(time, Math.random() * (noise.duration - 1));
  source.stop(time + length + 0.02);
}

function decay(context: AudioContext, volume: number, time: number, length: number): GainNode {
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.setValueAtTime(volume, time);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + length);
  return envelope;
}
