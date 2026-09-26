/// <reference types="navermaps" />

// NAVER Maps JavaScript API v3. The Client ID is public by design; NAVER only accepts it from
// the "Web 서비스 URL" origins registered for the application in the NCP console.
const SDK_URL = "https://oapi.map.naver.com/openapi/v3/maps.js";
const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "";

declare global {
  interface Window {
    navermap_authFailure?: () => void;
  }
}

let loading: Promise<typeof naver.maps> | undefined;
let authFailed = false;
const authFailureListeners = new Set<() => void>();

// NAVER calls window.navermap_authFailure when the Client ID or the page origin is rejected.
export function onAuthFailure(listener: () => void): () => void {
  if (authFailed) listener();
  authFailureListeners.add(listener);
  return () => void authFailureListeners.delete(listener);
}

// Loads the SDK once (with the geocoder submodule for addresses).
export function loadNaverMaps(): Promise<typeof naver.maps> {
  if (!CLIENT_ID) return Promise.reject(new Error("VITE_NAVER_MAP_CLIENT_ID is not set"));
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);

  loading ??= new Promise((resolve, reject) => {
    window.navermap_authFailure = () => {
      authFailed = true;
      console.error("NAVER Maps authentication failed. Check the Client ID and Web 서비스 URL.");
      for (const listener of authFailureListeners) listener();
    };

    const script = document.createElement("script");
    script.src = `${SDK_URL}?${new URLSearchParams({ ncpKeyId: CLIENT_ID, submodules: "geocoder" })}`;
    script.async = true;
    script.addEventListener("load", () => {
      if (window.naver?.maps) resolve(window.naver.maps);
      else reject(new Error("NAVER Maps SDK loaded without naver.maps"));
    });
    script.addEventListener("error", () => {
      script.remove();
      loading = undefined;
      reject(new Error("NAVER Maps SDK failed to load"));
    });
    document.head.appendChild(script);
  });
  return loading;
}
