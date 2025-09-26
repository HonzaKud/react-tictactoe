// src/components/Board.tsx
import Square from "./Square";
import type { Board as BoardType } from "../game/rules";

type Props = {
  board: BoardType;
  onSelect: (index: number) => void;
  winningLine: number[] | null;
};

export default function Board({ board, onSelect, winningLine }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {board.map((val, i) => (
        <Square
          key={i}
          value={val}
          onClick={() => onSelect(i)}
          isWinning={!!winningLine?.includes(i)}
        />
      ))}
    </div>
  );
}
