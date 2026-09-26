import { useEffect, useState } from "react";
import { loadNaverMaps, onAuthFailure } from "@/map/load-naver-maps";

export type NaverMapsStatus = "loading" | "ready" | "failed" | "unauthorized";

// Loads the SDK after the first render and tracks authentication failures reported later.
export function useNaverMaps(): NaverMapsStatus {
  const [status, setStatus] = useState<NaverMapsStatus>("loading");

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthFailure(() => {
      if (active) setStatus("unauthorized");
    });
    loadNaverMaps()
      .then(() => {
        if (active) setStatus((current) => (current === "loading" ? "ready" : current));
      })
      .catch((error: unknown) => {
        console.error(error);
        if (active) setStatus("failed");
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return status;
}
