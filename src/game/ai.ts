// src/game/ai.ts
// Tři úrovně obtížnosti protivníka + výběr tahu

import {
  type Board,
  type Mark,
  getEmptyIndices,
  calculateWinner,
  currentTurn,
  withMove,
} from "./rules";

/** Tři úrovně obtížnosti protivníka */
export type Level = "easy" | "medium" | "hard";

/** Veřejné API: vybere index tahu pro AI podle zadané obtížnosti */
export function selectAiMove(board: Board, ai: Mark, level: Level): number | null {
  switch (level) {
    case "easy":
      return chooseMoveEasy(board);
    case "medium":
      return chooseMoveMedium(board, ai);
    case "hard":
      return chooseMoveHard(board, ai);
    default:
      return chooseMoveMedium(board, ai);
  }
}

/* ---------- EASY: náhodný volný tah ---------- */
function chooseMoveEasy(board: Board): number | null {
  const empties = getEmptyIndices(board);
  if (!empties.length) return null;
  const idx = Math.floor(Math.random() * empties.length);
  return empties[idx]!;
}

/* ---------- MEDIUM: win → block → center → corner → side ---------- */
function chooseMoveMedium(board: Board, ai: Mark): number | null {
  const you: Mark = ai === "X" ? "O" : "X";

  // 1) Přímá výhra
  const winNow = findWinningMove(board, ai);
  if (winNow !== null) return winNow;

  // 2) Blok soupeře
  const block = findWinningMove(board, you);
  if (block !== null) return block;

  // 3) Střed
  if (board[4] === null) return 4;

  // 4) Rohy
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]!;

  // 5) Zbývající strany
  const empties = getEmptyIndices(board);
  return empties.length ? empties[0]! : null;
}

function findWinningMove(board: Board, mark: Mark): number | null {
  const empties = getEmptyIndices(board);
  for (const i of empties) {
    const next = withMove(board, i, mark);
    if (calculateWinner(next) === mark) return i;
  }
  return null;
}

/* ---------- HARD: minimax s alfa–beta a preferencí rychlé výhry ---------- */
function chooseMoveHard(board: Board, ai: Mark): number | null {
  const turn = currentTurn(board);
  const result = minimax(board, ai, turn, 0, -Infinity, Infinity);
  return result.move;
}

function minimax(
  board: Board,
  ai: Mark,
  current: Mark,
  depth: number,
  alpha: number,
  beta: number
): { score: number; move: number | null } {
  const winner = calculateWinner(board);
  if (winner === ai) return { score: 10 - depth, move: null };
  if (winner && winner !== ai) return { score: -10 + depth, move: null };

  const empties = getEmptyIndices(board);
  if (!empties.length) return { score: 0, move: null };

  const maximizing = current === ai;
  let bestMove: number | null = null;
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const i of empties) {
    const next = withMove(board, i, current);
    const res = minimax(next, ai, current === "X" ? "O" : "X", depth + 1, alpha, beta);

    if (maximizing) {
      if (res.score > bestScore) {
        bestScore = res.score;
        bestMove = i;
      }
      if (res.score > alpha) alpha = res.score;
    } else {
      if (res.score < bestScore) {
        bestScore = res.score;
        bestMove = i;
      }
      if (res.score < beta) beta = res.score;
    }
    if (beta <= alpha) break; // alfa–beta ořez
  }

  return { score: bestScore, move: bestMove };
}
