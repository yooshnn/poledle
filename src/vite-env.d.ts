/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Date of puzzle #1 (YYYY-MM-DD, KST).
  readonly VITE_LAUNCH_DATE?: string;
  // Changing the seed reshuffles which number is played on which day.
  readonly VITE_PUZZLE_SEED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
