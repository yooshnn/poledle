import { useCallback, useState } from "react";
import { loadStore, updateStore } from "./storage";

// Hard mode hides hints (grid labels, matching digits, direction). It can be toggled any time.
export function useHardMode(): [boolean, (enabled: boolean) => void] {
  const [hardMode, setHardModeState] = useState(() => loadStore().hardMode);

  const setHardMode = useCallback((enabled: boolean) => {
    setHardModeState(enabled);
    updateStore((store) => ({ ...store, hardMode: enabled }));
  }, []);

  return [hardMode, setHardMode];
}
