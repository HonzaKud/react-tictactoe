import { useEffect, useMemo, useRef, useState } from "react";
import Board from "./components/Board";
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
  // --- Stav hry ---
  const [board, setBoard] = useState<BoardType>([...EMPTY_BOARD]);
  const [level, setLevel] = useState<Level>("medium");
  const [playerIsX, setPlayerIsX] = useState(true);
  const [alternateStarter, setAlternateStarter] = useState(true);
  const [score, setScore] = useState({ player: 0, ai: 0, draw: 0 });

  // --- Odvozené hodnoty ---
  const you: Mark = playerIsX ? "X" : "O";
  const ai: Mark = playerIsX ? "O" : "X";

  const winner = useMemo(() => calculateWinner(board), [board]);
  const winningLine = useMemo(() => findWinningLine(board), [board]);
  const full = useMemo(() => isBoardFull(board), [board]);
  const gameOver = !!winner || full;

  // --- Přičtení skóre jen jednou po konci hry ---
  const prevGameOver = useRef(false);
  useEffect(() => {
    if (!prevGameOver.current && gameOver) {
      setScore((s) => {
        if (winner === you) return { ...s, player: s.player + 1 };
        if (winner === ai) return { ...s, ai: s.ai + 1 };
        return { ...s, draw: s.draw + 1 };
      });
    }
    prevGameOver.current = gameOver;
  }, [gameOver, winner, you, ai]);

  // --- AI tah ---
  const playersTurn = useMemo(() => currentTurn(board) === you, [board, you]);
  useEffect(() => {
    if (gameOver) return;
    if (playersTurn) return;

    const id = setTimeout(() => {
      const move = selectAiMove(board, ai, level);
      if (move !== null) {
        setBoard((b) => withMove(b, move, ai));
      }
    }, 350); // malá prodleva pro UX
    return () => clearTimeout(id);
  }, [board, ai, level, playersTurn, gameOver]);

  // --- Handlery ---
  const handleSelect = (index: number) => {
    if (gameOver) return;
    if (!playersTurn) return;
    if (board[index] !== null) return;
    setBoard((b) => withMove(b, index, you));
  };

  const newGame = (rotateStarter: boolean) => {
    setBoard([...EMPTY_BOARD]);
    if (rotateStarter && alternateStarter) {
      setPlayerIsX((v) => !v);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 text-gray-900">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow">
        <h1 className="text-center text-2xl font-bold">Piškvorky 3×3</h1>

        {/* Panel: skóre a nastavení */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border p-3 text-center">
            <div className="text-xs uppercase text-gray-500">Hráč</div>
            <div className="text-2xl font-semibold">{score.player}</div>
          </div>
          <div className="rounded-2xl border p-3 text-center">
            <div className="text-xs uppercase text-gray-500">Remízy</div>
            <div className="text-2xl font-semibold">{score.draw}</div>
          </div>
          <div className="rounded-2xl border p-3 text-center">
            <div className="text-xs uppercase text-gray-500">Počítač</div>
            <div className="text-2xl font-semibold">{score.ai}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2">
            <span className="text-sm">Obtížnost:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="rounded-xl border px-2 py-1"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard (minimax)</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={alternateStarter}
              onChange={(e) => setAlternateStarter(e.target.checked)}
            />
            <span className="text-sm">Střídat, kdo začíná</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border px-3 py-1 hover:bg-gray-50"
              onClick={() => newGame(false)}
            >
              Nová hra
            </button>
            <button
              className="rounded-xl border px-3 py-1 hover:bg-gray-50"
              onClick={() => newGame(true)}
            >
              Nová hra &amp; prohodit start
            </button>
          </div>
        </div>

        {/* Stav hry */}
        <div className="mt-3 text-center text-sm text-gray-600">
          <div>
            Ty hraješ: <span className="font-semibold">{you}</span> &nbsp;|&nbsp; PC:{" "}
            <span className="font-semibold">{ai}</span>
          </div>
          <div className="mt-1">
            {gameOver ? (
              winner ? (
                <span className="font-medium">
                  Vyhrál {winner === you ? "hráč" : "počítač"} ({winner})
                </span>
              ) : (
                <span className="font-medium">Remíza</span>
              )
            ) : playersTurn ? (
              <span className="font-medium">Jsi na tahu…</span>
            ) : (
              <span className="font-medium">Počítač přemýšlí…</span>
            )}
          </div>
        </div>

        {/* Hrací pole */}
        <div className="mt-5 grid place-items-center">
          <Board board={board} onSelect={handleSelect} winningLine={winningLine} />
        </div>

        {/* Nápověda */}
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
