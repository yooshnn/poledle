import { useSyncExternalStore } from "react";
import { loadStore, updateStore } from "./storage";

// Hard mode hides hints (grid labels, matching digits, direction) in every mode. It can be
// toggled any time. Settings and the game pages read it separately, so it lives in a small
// shared store.
let hardMode: boolean | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

const read = () => (hardMode ??= loadStore().hardMode);

function setHardMode(enabled: boolean) {
  hardMode = enabled;
  updateStore((store) => ({ ...store, hardMode: enabled }));
  for (const listener of listeners) listener();
}

export function useHardMode(): [boolean, (enabled: boolean) => void] {
  return [useSyncExternalStore(subscribe, read), setHardMode];
}
