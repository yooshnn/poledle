import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // Binary data such as src/data/pole-numbers.bin is imported with ?inline.
  assetsInclude: ["**/*.bin"],
  test: { include: ["src/**/*.test.ts"], passWithNoTests: true },
});
