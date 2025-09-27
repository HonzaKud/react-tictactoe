import React from "react";
import Square from "./Square";
import type { Board as BoardType } from "../game/rules";

type Props = {
  board: BoardType;
  winningLine: number[] | null;
  onSelect: (index: number) => void;
};

function BoardImpl({ board, winningLine, onSelect }: Props) {
  return (
    <div role="grid" aria-label="Hrací deska 3x3" className="grid grid-cols-3 gap-3">
      {board.map((cell, i) => (
        <Square
          key={i}
          value={cell}
          highlight={!!winningLine?.includes(i)}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}

const Board = React.memo(BoardImpl);
export default Board;
