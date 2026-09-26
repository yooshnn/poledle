import { useSyncExternalStore, type ComponentProps, type MouseEvent } from "react";

// Two pages, no router library: the path is read from the History API.
// Hosts serve index.html for every path (SPA fallback), so unknown paths are rewritten to "/".
const ROUTES = ["/"] as const;
export type Route = (typeof ROUTES)[number];

const isRoute = (path: string): path is Route => (ROUTES as readonly string[]).includes(path);

// pushState does not fire popstate, so navigate() announces changes itself.
const NAVIGATE_EVENT = "poledle:navigate";

function subscribe(onChange: () => void) {
  addEventListener("popstate", onChange);
  addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    removeEventListener("popstate", onChange);
    removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

export function normalizeLocation() {
  if (!isRoute(location.pathname)) history.replaceState(null, "", "/");
}

export function useRoute(): Route {
  const path = useSyncExternalStore(subscribe, () => location.pathname);
  return isRoute(path) ? path : "/";
}

export function navigate(route: Route) {
  if (location.pathname === route) return;
  history.pushState(null, "", route);
  dispatchEvent(new Event(NAVIGATE_EVENT));
}

// An <a> that switches pages in place; modified clicks (new tab, …) keep the browser default.
export function Link({ to, onClick, ...props }: ComponentProps<"a"> & { to: Route }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || event.button !== 0 || modified) return;
    event.preventDefault();
    navigate(to);
  }
  return <a href={to} onClick={handleClick} {...props} />;
}
