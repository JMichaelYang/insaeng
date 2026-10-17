import { mergeClasses } from "../utils/merge-classes";

export type TextWobble = { amplitude: number; period: number };

export function WobbleText({
  text,
  wobble,
  className,
}: {
  text: string;
  wobble: TextWobble;
  className?: string;
}) {
  const { amplitude, period } = wobble;
  const k = (2 * Math.PI) / period;
  return (
    <span className={mergeClasses("inline-block whitespace-pre", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {Array.from(text, (letter, i) => (
          <span
            key={i}
            className="inline-block"
            style={{ translate: `0 ${amplitude * Math.sin(k * i)}em` }}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}
