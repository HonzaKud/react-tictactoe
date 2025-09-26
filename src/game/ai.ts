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
      return chooseMoveHard(board, ai); // minimax (neporazitelné)
    default:
      return chooseMoveMedium(board, ai);
  }
}

/* ---------- EASY: náhodný tah ---------- */
function chooseMoveEasy(board: Board): number | null {
  const empties = getEmptyIndices(board);
  if (!empties.length) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

/* ---------- MEDIUM: win → block → center → corner → side ---------- */
function chooseMoveMedium(board: Board, ai: Mark): number | null {
  const human: Mark = ai === "X" ? "O" : "X";
  const empties = getEmptyIndices(board);
  if (!empties.length) return null;

  for (const i of empties) if (calculateWinner(withMove(board, i, ai)) === ai) return i;
  for (const i of empties) if (calculateWinner(withMove(board, i, human)) === human) return i;

  if (board[4] === null) return 4;

  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  return empties[0];
}

/* ---------- HARD: minimax (s alpha-beta) ---------- */
function minimax(
  board: Board,
  ai: Mark,
  current: Mark,
  alpha = -Infinity,
  beta = Infinity
): { score: number; move: number | null } {
  const winner = calculateWinner(board);
  if (winner === ai) return { score: 10, move: null };
  if (winner && winner !== ai) return { score: -10, move: null };

  const empties = getEmptyIndices(board);
  if (!empties.length) return { score: 0, move: null };

  const isMax = current === ai;
  let bestMove: number | null = null;
  let bestScore = isMax ? -Infinity : Infinity;

  for (const i of empties) {
    const next = withMove(board, i, current);
    const res = minimax(next, ai, current === "X" ? "O" : "X", alpha, beta);
    const score = res.score;

    if (isMax) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = i;
      }
      beta = Math.min(beta, bestScore);
    }
    if (beta <= alpha) break;
  }

  return { score: bestScore, move: bestMove };
}

function chooseMoveHard(board: Board, ai: Mark): number | null {
  const turn = currentTurn(board);
  const result = minimax(board, ai, turn);
  return result.move;
}
