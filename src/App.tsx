import { useEffect, useMemo, useState } from "react";
import { selectAiMove, type Level } from "./game/ai";
import {
  EMPTY_BOARD,
  type Board as BoardType,
  type Mark,
  calculateWinner,
  findWinningLine,
  isFull as isBoardFull,
  withMove,
  currentTurn,
} from "./game/rules";

export default function App() {
  const [board, setBoard] = useState<BoardType>([...EMPTY_BOARD]);
  const [level, setLevel] = useState<Level>("medium");
  const [playerIsX, setPlayerIsX] = useState(true);
  const [alternateStarter, setAlternateStarter] = useState(true);
  const [playerStartsNext, setPlayerStartsNext] = useState(true);
  const [scores, setScores] = useState({ player: 0, draws: 0, computer: 0 });

  const winner = useMemo(() => calculateWinner(board), [board]);
  const winLine = useMemo(() => findWinningLine(board), [board]);
  const full = useMemo(() => isBoardFull(board), [board]);

  const playerMark: Mark = playerIsX ? "X" : "O";
  const computerMark: Mark = playerIsX ? "O" : "X";
  const turn: Mark = currentTurn(board);
  const playersTurn = turn === playerMark;
  const gameOver = !!winner || full;

  // hráč klikne
  function handleClick(i: number) {
    if (gameOver || !playersTurn || board[i] !== null) return;
    setBoard((b) => withMove(b, i, playerMark));
  }

  // AI tah
  useEffect(() => {
    if (gameOver || playersTurn) return;
    const id = setTimeout(() => {
      const move = selectAiMove(board, computerMark, level);
      if (move !== null) setBoard((b) => withMove(b, move, computerMark));
    }, 250);
    return () => clearTimeout(id);
  }, [playersTurn, gameOver, board, computerMark, level]);

  // po konci hry → skóre
  useEffect(() => {
    if (!gameOver) return;
    if (winner === playerMark) setScores((s) => ({ ...s, player: s.player + 1 }));
    else if (winner === computerMark) setScores((s) => ({ ...s, computer: s.computer + 1 }));
    else setScores((s) => ({ ...s, draws: s.draws + 1 }));
  }, [gameOver, winner, playerMark, computerMark]);

  function newGame() {
    const starterIsPlayer = alternateStarter ? !playerStartsNext : playerStartsNext;
    setBoard([...EMPTY_BOARD]);
    setPlayerIsX(starterIsPlayer); // X vždy začíná
    setPlayerStartsNext((v) => (alternateStarter ? !v : v));
  }

  function resetScores() {
    setScores({ player: 0, draws: 0, computer: 0 });
  }

  const status = winner
    ? winner === playerMark
      ? "Vyhrál jsi! 🎉"
      : "Vyhrál počítač. 🤖"
    : full
    ? "Remíza."
    : playersTurn
    ? "Na tahu: Ty"
    : "Počítač přemýšlí…";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Piškvorky 3×3</h1>
            <p className="text-sm text-gray-600">Hráč vs. Počítač • střídání, kdo začíná</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border px-2 py-1 text-xs">
              Jsi: <strong>{playerMark}</strong>
            </span>
            <label className="text-sm">
              Obtížnost:{" "}
              <select
                className="rounded-md border px-2 py-1 text-sm"
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="font-medium">{status}</div>
          <div className="flex gap-2">
            <button
              onClick={newGame}
              className="rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-100"
              title="Nová hra (střídání startu)"
            >
              Nová hra (střídání startu)
            </button>
            <button
              onClick={resetScores}
              className="rounded-xl border bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-100"
            >
              Resetovat skóre
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
          {board.map((cell, i) => {
            const highlight =
              winLine && (winLine as number[]).includes(i) ? "border-green-500" : "border-gray-200";
            const canHover = !gameOver && playersTurn && cell === null;
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={cell !== null || gameOver || !playersTurn}
                className={[
                  "aspect-square rounded-2xl border bg-white text-4xl font-bold shadow-sm",
                  "flex items-center justify-center select-none",
                  highlight,
                  canHover ? "hover:bg-gray-50" : "opacity-100",
                ].join(" ")}
              >
                {cell ?? ""}
              </button>
            );
          })}
        </div>

        {/* Score */}
        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <div className="text-sm text-gray-600">Hráč ({playerMark})</div>
            <div className="text-2xl font-bold">{scores.player}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <div className="text-sm text-gray-600">Remízy</div>
            <div className="text-2xl font-bold">{scores.draws}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <div className="text-sm text-gray-600">Počítač ({computerMark})</div>
            <div className="text-2xl font-bold">{scores.computer}</div>
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
