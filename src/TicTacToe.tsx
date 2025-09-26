import { useEffect, useMemo, useState } from "react";

type Cell = "X" | "O" | null;
type Board = Cell[];

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

type Scores = { player: number; computer: number; draws: number };
type Level = "Easy" | "Medium" | "Hard";

function calculateWinner(board: Board): Cell {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function getEmptyIndices(board: Board): number[] {
  const out: number[] = [];
  for (let i = 0; i < board.length; i++) if (board[i] === null) out.push(i);
  return out;
}

function makeMove(board: Board, idx: number, mark: "X" | "O"): Board {
  const next = board.slice();
  next[idx] = mark;
  return next;
}

// ---------- AI -------------------------------------------------
function randomMove(board: Board): number {
  const empties = getEmptyIndices(board);
  return empties[Math.floor(Math.random() * empties.length)];
}

function heuristicMove(board: Board, ai: "X" | "O"): number {
  const human: "X" | "O" = ai === "X" ? "O" : "X";
  const empties = getEmptyIndices(board);

  // 1) Win if possible
  for (const i of empties) {
    if (calculateWinner(makeMove(board, i, ai)) === ai) return i;
  }
  // 2) Block immediate human win
  for (const i of empties) {
    if (calculateWinner(makeMove(board, i, human)) === human) return i;
  }
  // 3) Center
  if (board[4] === null) return 4;
  // 4) Corners
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // 5) Sides
  return empties[0];
}

function minimax(
  board: Board,
  ai: "X" | "O",
  current: "X" | "O",
  alpha = -Infinity,
  beta = Infinity
): { score: number; move: number | null } {
  const winner = calculateWinner(board);
  if (winner === ai) return { score: 10, move: null };
  if (winner && winner !== ai) return { score: -10, move: null };
  const empties = getEmptyIndices(board);
  if (empties.length === 0) return { score: 0, move: null };

  const isMax = current === ai;
  let bestMove: number | null = null;
  let bestScore = isMax ? -Infinity : Infinity;

  for (const i of empties) {
    const next = makeMove(board, i, current);
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

function bestMove(board: Board, ai: "X" | "O", level: Level): number {
  if (level === "Easy") return randomMove(board);
  if (level === "Medium") return heuristicMove(board, ai);
  // Hard = minimax
  const result = minimax(board, ai, "X");
  return result.move ?? heuristicMove(board, ai);
}

// ---------- UI -------------------------------------------------
export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // kdo je na tahu (X/O)
  const [playerIsX, setPlayerIsX] = useState(true); // je člověk "X"?
  const [playerStartsNext, setPlayerStartsNext] = useState(true); // střídání startéra
  const [scores, setScores] = useState<Scores>({ player: 0, computer: 0, draws: 0 });
  const [alternateStarter, setAlternateStarter] = useState(true);
  const [level, setLevel] = useState<Level>("Medium");
  const winner = useMemo(() => calculateWinner(board), [board]);
  const isFull = useMemo(() => getEmptyIndices(board).length === 0, [board]);
  const gameOver = !!winner || isFull;

  const playerMark: "X" | "O" = playerIsX ? "X" : "O";
  const computerMark: "X" | "O" = playerIsX ? "O" : "X";
  const turnMark: "X" | "O" = xIsNext ? "X" : "O";
  const isPlayersTurn = turnMark === playerMark;

  // Konec hry → zapiš skóre
  useEffect(() => {
    if (!gameOver) return;
    if (winner === playerMark) setScores((s) => ({ ...s, player: s.player + 1 }));
    else if (winner === computerMark) setScores((s) => ({ ...s, computer: s.computer + 1 }));
    else setScores((s) => ({ ...s, draws: s.draws + 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, winner]);

  // Počítačův tah
  useEffect(() => {
    if (gameOver) return;
    if (isPlayersTurn) return;
    const id = setTimeout(() => {
      const move = bestMove(board, computerMark, level);
      setBoard((b) => makeMove(b, move, computerMark));
      setXIsNext((v) => !v);
    }, 300);
    return () => clearTimeout(id);
  }, [isPlayersTurn, gameOver, board, computerMark, level]);

  function handleClick(idx: number) {
    if (gameOver) return;
    if (!isPlayersTurn) return;
    if (board[idx] !== null) return;
    setBoard((b) => makeMove(b, idx, playerMark));
    setXIsNext((v) => !v);
  }

  function startNewGame() {
    const starterIsPlayer = alternateStarter ? !playerStartsNext : playerStartsNext;
    setBoard(Array(9).fill(null));
    setXIsNext(true); // X vždy začíná
    setPlayerIsX(starterIsPlayer);
    setPlayerStartsNext((prev) => (alternateStarter ? !prev : prev));
  }

  function resetScores() {
    setScores({ player: 0, computer: 0, draws: 0 });
  }

  const status = (() => {
    if (winner) return winner === playerMark ? "Vyhrál jsi! 🎉" : "Počítač vyhrál. 🤖";
    if (isFull) return "Remíza.";
    return isPlayersTurn ? "Jsi na tahu." : "Počítač přemýšlí…";
  })();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Piškvorky 3×3</h1>
          <p className="text-sm text-gray-600">X vždy začíná. Startér se může střídat.</p>
        </header>

        {/* Ovládání */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-medium">Obtížnost</div>
            <div className="flex gap-2">
              {(["Easy", "Medium", "Hard"] as Level[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={
                    "rounded-xl px-3 py-1.5 text-sm border " +
                    (level === lvl ? "bg-gray-900 text-white" : "bg-white")
                  }
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Střídat startéra (hráč/PC)</span>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={alternateStarter}
                onChange={(e) => setAlternateStarter(e.target.checked)}
              />
            </label>
            <div className="mt-2 text-xs text-gray-600">
              Příští hra začne:{" "}
              <strong>{(alternateStarter ? !playerStartsNext : playerStartsNext) ? "hráč (X)" : "počítač (X)"}</strong>
            </div>
          </div>
        </div>

        {/* Stav a akce */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-semibold">{status}</div>
          <div className="flex gap-2">
            <button
              onClick={startNewGame}
              className="rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-100"
            >
              Nová hra
            </button>
            <button
              onClick={resetScores}
              className="rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-100"
            >
              Reset skóre
            </button>
          </div>
        </div>

        {/* Hrací plocha */}
        <main className="grid grid-cols-3 gap-2">
          {board.map((cell, i) => {
            const isWinCell =
              winner &&
              WIN_LINES.some(([a, b, c]) => [a, b, c].includes(i) && board[a] && board[a] === board[b] && board[a] === board[c]);
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={cell !== null || gameOver || !isPlayersTurn}
                className={
                  "aspect-square rounded-2xl border bg-white text-4xl font-bold shadow-sm " +
                  "flex items-center justify-center select-none " +
                  (isWinCell ? "border-green-500" : "") +
                  (cell === null && isPlayersTurn && !gameOver ? " hover:bg-gray-50" : "")
                }
              >
                {cell ?? ""}
              </button>
            );
          })}
        </main>

        {/* Skóre a info */}
        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <div className="text-sm text-gray-600">Hráč ({playerMark})</div>
            <div className="text-2xl font-bold">{scores.player}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <div className="text-sm text-gray-600">Počítač ({computerMark})</div>
            <div className="text-2xl font-bold">{scores.computer}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <div className="text-sm text-gray-600">Remízy</div>
            <div className="text-2xl font-bold">{scores.draws}</div>
          </div>
        </section>

        <details className="mt-6 rounded-2xl border bg-white p-4 text-sm text-gray-700 shadow-sm">
          <summary className="cursor-pointer select-none font-medium text-gray-900">
            Jak to funguje
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>X</strong> vždy začíná. Kdo je X (hráč/PC) se může střídat po každé hře.</li>
            <li>Obtížnost: <em>Easy</em> = náhodné tahy; <em>Medium</em> = výhra → blok → střed → roh; <em>Hard</em> = minimax.</li>
            <li>Skóre se sčítá automaticky po konci hry.</li>
          </ul>
        </details>
      </div>
    </div>
  );
}
