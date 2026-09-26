import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";

// Daily lives at "/", the only page. Hosts serve index.html for unknown paths (SPA fallback),
// so any other path is simply rewritten.
if (location.pathname !== "/") history.replaceState(null, "", "/");

const root = document.getElementById("root");
if (!root) throw new Error("#root element is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
