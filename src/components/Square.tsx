// Square.tsx
type Props = {
  value: "X" | "O" | null;
  highlight?: boolean;
  onClick: () => void;
};

export default function Square({ value, highlight = false, onClick }: Props) {
  return (
    <button
      role="gridcell"
      tabIndex={0}
      aria-label={value ? `Pole ${value}` : "Prázdné pole"}
      onClick={onClick}
      className={[
        "flex h-20 w-20 items-center justify-center rounded-2xl border text-3xl font-bold",
        highlight ? "bg-yellow-100 border-yellow-300" : "bg-white hover:bg-gray-50",
      ].join(" ")}
    >
      {value}
    </button>
  );
}
