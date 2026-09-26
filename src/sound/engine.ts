// One AudioContext for the page. Browsers block audio until the page gets a user gesture,
// so the context is created on the first pointer or key press and resumed on later ones
// (mobile browsers suspend it after interruptions such as calls).

export type AudioEngine = {
  context: AudioContext;
  // Mix buses; effects and ambience can be balanced separately.
  effects: GainNode;
  ambience: GainNode;
};

let engine: AudioEngine | null = null;
const readyListeners = new Set<() => void>();

// The engine once audio is allowed and running, otherwise null.
export function runningEngine(): AudioEngine | null {
  return engine?.context.state === "running" ? engine : null;
}

// Called whenever audio becomes available (after the first gesture, or a resume).
export function onAudioReady(listener: () => void): () => void {
  readyListeners.add(listener);
  return () => void readyListeners.delete(listener);
}

function notifyReady() {
  for (const listener of readyListeners) listener();
}

function unlock() {
  if (typeof AudioContext === "undefined") return;
  if (!engine) {
    const context = new AudioContext();
    const master = new GainNode(context, { gain: 0.8 });
    master.connect(context.destination);
    engine = {
      context,
      effects: new GainNode(context, { gain: 0.7 }),
      ambience: new GainNode(context, { gain: 0.5 }),
    };
    engine.effects.connect(master);
    engine.ambience.connect(master);
    context.addEventListener("statechange", notifyReady);
  }
  void engine.context.resume().then(notifyReady);
}

export function unlockAudioOnGesture() {
  for (const type of ["pointerdown", "keydown"]) {
    addEventListener(type, unlock, { capture: true, passive: true });
  }
}
