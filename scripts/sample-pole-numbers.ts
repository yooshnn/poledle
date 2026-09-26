// Builds src/data/pole-numbers.bin from the KEPCO pole number CSVs (public data portal,
// one CP949 file per region with a 전산화번호 column). The full data is ~7 million numbers,
// far too big to ship, so an equal share is sampled from every file in the directory.
//
// Usage: pnpm data:pole-numbers <csv-directory>
import { createReadStream } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { answerCells } from "../src/domain/answers";
import { isPoleNumber } from "../src/domain/pole-number";
import { encodePoleNumbers } from "../src/domain/pole-number-codec";
import { createRandom, shuffle } from "../src/domain/random";

const SAMPLE_SIZE = 10_000;
const SAMPLE_SEED = "1";
const OUTPUT = new URL("../src/data/pole-numbers.bin", import.meta.url);
const CODE_COLUMN = "전산화번호";

const csvDirectory = process.argv[2];
if (!csvDirectory) throw new Error("Usage: pnpm data:pole-numbers <csv-directory>");

const files = (await readdir(csvDirectory)).filter((name) => name.endsWith(".csv")).toSorted();
const sample: string[] = [];
const usedLocations = new Set<string>(); // numbers sharing the first 7 characters share a cell

for (const [index, file] of files.entries()) {
  const quota = regionQuota(index, files.length);
  // One file at a time keeps memory bounded (the largest file has over a million numbers).
  // oxlint-disable-next-line no-await-in-loop
  const codes = await readPoleNumbers(path.join(csvDirectory, file));
  const candidates = shuffle([...codes], createRandom(`${SAMPLE_SEED}:${index}`));

  let picked = 0;
  for (const code of candidates) {
    if (picked === quota) break;
    const location = code.slice(0, 7);
    if (usedLocations.has(location) || answerCells(code).length === 0) continue;
    usedLocations.add(location);
    sample.push(code);
    picked++;
  }
  console.log(`${file}: ${codes.size} numbers, sampled ${picked}/${quota}`);
}

const encoded = encodePoleNumbers(sample);
await writeFile(OUTPUT, encoded);
console.log(`Wrote ${sample.length} pole numbers (${encoded.length} bytes) to ${OUTPUT.pathname}`);

// Splits SAMPLE_SIZE as evenly as possible; the first regions take the remainder.
function regionQuota(index: number, regions: number): number {
  const base = Math.floor(SAMPLE_SIZE / regions);
  return base + (index < SAMPLE_SIZE % regions ? 1 : 0);
}

// Unique, well-formed numbers from one CSV, streamed line by line.
async function readPoleNumbers(file: string): Promise<Set<string>> {
  const codes = new Set<string>();
  let column = -1;
  for await (const line of readLines(file, "euc-kr")) {
    const fields = line.split(",");
    if (column === -1) {
      column = fields.findIndex((field) => field.includes(CODE_COLUMN));
      if (column === -1) throw new Error(`${file}: no ${CODE_COLUMN} column`);
      continue;
    }
    const code = fields[column]?.trim() ?? "";
    if (isPoleNumber(code)) codes.add(code);
  }
  return codes;
}

async function* readLines(file: string, encoding: string): AsyncGenerator<string> {
  const decoder = new TextDecoder(encoding);
  let pending = "";
  for await (const chunk of createReadStream(file)) {
    pending += decoder.decode(chunk as Buffer, { stream: true });
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() ?? "";
    yield* lines;
  }
  pending += decoder.decode();
  if (pending) yield pending;
}
