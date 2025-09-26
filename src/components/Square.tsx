// src/components/Square.tsx
import type { Cell } from "../game/rules";

type Props = {
  value: Cell;
  onClick: () => void;
  isWinning?: boolean;
};

export default function Square({ value, onClick, isWinning }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={value !== null}
      className={[
        "aspect-square w-20 sm:w-24 md:w-28 grid place-items-center",
        "rounded-2xl border border-gray-300",
        "text-3xl font-semibold",
        value === "X" ? "text-gray-900" : value === "O" ? "text-gray-700" : "text-gray-400",
        "hover:shadow-md active:scale-[0.98] transition",
        isWinning ? "bg-yellow-100" : "bg-white",
        value !== null ? "cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
      aria-label={value ? `Cell ${value}` : "Empty cell"}
    >
      {value}
    </button>
  );
}
