/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Date of puzzle #1 (YYYY-MM-DD, KST).
  readonly VITE_LAUNCH_DATE?: string;
  // Changing the seed reshuffles which number is played on which day.
  readonly VITE_PUZZLE_SEED?: string;
  // NAVER Cloud Platform Maps application Client ID (public; restricted by Web 서비스 URL).
  readonly VITE_NAVER_MAP_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
