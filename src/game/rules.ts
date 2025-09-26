// src/game/rules.ts
// Základní typy a pravidla hry pro piškvorky 3×3

export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Board = Cell[];

// Vítězné řady
export const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Prázdný board (9 polí)
export const EMPTY_BOARD: Board = Array(9).fill(null);

// Vrátí vítěze ("X"/"O") nebo null
export function calculateWinner(board: Board): Mark | null {
  for (const [a, b, c] of WIN_LINES) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) return v;
  }
  return null;
}

// Vrátí vítěznou linii (trojici indexů) nebo null
export function findWinningLine(board: Board): number[] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = board[a];
    if (v && v === board[b] && v === board[c]) return line;
  }
  return null;
}

// Je hrací pole plné?
export function isFull(board: Board): boolean {
  return board.every((c) => c !== null);
}

// Indexy prázdných polí
export function getEmptyIndices(board: Board): number[] {
  const out: number[] = [];
  for (let i = 0; i < board.length; i++) if (board[i] === null) out.push(i);
  return out;
}

// Kdo je na tahu (X vždy začíná)
export function currentTurn(board: Board): Mark {
  let x = 0, o = 0;
  for (const c of board) {
    if (c === "X") x++;
    else if (c === "O") o++;
  }
  return x === o ? "X" : "O";
}

// Nový board s provedeným tahem
export function withMove(board: Board, idx: number, mark: Mark): Board {
  if (board[idx] !== null) return board;
  const next = board.slice();
  next[idx] = mark;
  return next;
}
