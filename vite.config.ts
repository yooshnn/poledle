import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// 4173 is registered as a Web service URL for the NAVER Maps application, so dev and preview share it.
const port = 4173;

export default defineConfig({
  plugins: [react()],
  server: { port, strictPort: true },
  preview: { port, strictPort: true },
  test: { include: ["src/**/*.test.ts"], passWithNoTests: true },
});
