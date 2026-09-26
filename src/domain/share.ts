import { BLOCK_SIZE, CELL_SIZE, MAX_GUESSES, SQUARE_SIZE } from "./constants";
import { sameRegion, type Cell } from "./cell";
import type { Puzzle } from "./daily";
import { gameStatus, isCorrect, type Target } from "./game";
import { DIFFICULTIES, INFINITE_TITLE, type Difficulty, type RunEnd } from "./infinite";

// Texts copied by the share buttons, written to be pasted into a post on X. They never include
// the pole number or a location. The link goes last so the post gets a link preview card.
export const SITE_URL = "https://poledle.cupya.me";
const HASHTAG = "#전봇들";

// Opens X's post composer with the text filled in.
// encodeURIComponent keeps spaces as %20, which every client reads as a space ("+" is not).
export const xPostUrl = (text: string) =>
  `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;

// One square per guess, by the closest grid level reached.
function guessSquare(guess: Cell, answers: Cell[]): string {
  const target: Target = { answers, precision: CELL_SIZE };
  if (isCorrect(guess, target)) return "🟩";
  if (answers.some((answer) => sameRegion(guess, answer, SQUARE_SIZE))) return "🟨";
  if (answers.some((answer) => sameRegion(guess, answer, BLOCK_SIZE))) return "🟥";
  return "⬛";
}

// 전봇들 #3 3/6 🔥5일
//
// ⬛
// 🟥
// 🟩
// 🟩
// 🟩
// 🟩
//
// #전봇들 https://poledle.cupya.me
//
// The squares stack into a pole, always six high: a win fills the rest with green.
export function dailyShareText(
  puzzle: Puzzle,
  guesses: Cell[],
  answers: Cell[],
  streak: number,
): string {
  const won = gameStatus(guesses, { answers, precision: CELL_SIZE }) === "won";
  const score = `${won ? guesses.length : "X"}/${MAX_GUESSES}`;
  const streakText = streak >= 2 ? ` 🔥${streak}일` : "";
  const squares = guesses.map((guess) => guessSquare(guess, answers));
  const pole = [...squares, ...Array<string>(MAX_GUESSES - squares.length).fill("🟩")];
  const title = `전봇들 #${puzzle.number} ${score}${streakText}`;
  return `${title}\n\n${pole.join("\n")}\n\n${HASHTAG} ${SITE_URL}`;
}

const END_MARK: Record<RunEnd, string> = { missed: "❌", timeout: "⏱️", "gave-up": "🏳️" };

// 어디까지 전봇들 챌린지 · Normal
// 12문제 연속 정답 ⏱️
// #전봇들 https://poledle.cupya.me/infinite
export function infiniteShareText(difficulty: Difficulty, score: number, end: RunEnd): string {
  const title = `${INFINITE_TITLE} · ${DIFFICULTIES[difficulty].label}`;
  return `${title}\n${score}문제 연속 정답 ${END_MARK[end]}\n${HASHTAG} ${SITE_URL}/infinite`;
}
