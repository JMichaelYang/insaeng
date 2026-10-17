import { mergeClasses } from "../../utils/merge-classes";

const squiggles = [7, 12, 17]
  .map((y) => `M4 ${y}q2 -2 4 0t4 0t4 0t4 0`)
  .join("");

export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={mergeClasses("size-icon-lg", className)}
      aria-hidden
    >
      <path
        d={squiggles}
        className="fill-none stroke-current"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
