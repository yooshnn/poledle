import { useSyncExternalStore } from "react";
import { loadStore, updateStore, type Settings } from "./storage";

// Preferences shared by every component that shows them and by non-React code such as the
// sound engine. Read once from storage, then kept here and written through on change.
export type SettingName = keyof Settings;

let current: Settings | undefined;
const listeners = new Set<() => void>();

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export const getSettings = (): Settings => (current ??= loadStore().settings);

export function setSetting(name: SettingName, value: boolean) {
  current = { ...getSettings(), [name]: value };
  updateStore((store) => ({ ...store, settings: { ...store.settings, [name]: value } }));
  for (const listener of listeners) listener();
}

export function useSetting(name: SettingName): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribeSettings, () => getSettings()[name]);
  return [value, (next) => setSetting(name, next)];
}
