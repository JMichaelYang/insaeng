import { mergeClasses } from "../utils/merge-classes";

export type TextWobble = { amplitude: number; period: number };

const letterAdvance = 0.5;

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
        {Array.from(text, (letter, i) => {
          const offset = amplitude * Math.sin(k * i);
          const slope = (amplitude * k * Math.cos(k * i)) / letterAdvance;
          return (
            <span
              key={i}
              className="inline-block"
              style={{
                translate: `0 ${offset}em`,
                rotate: `${(Math.atan(slope) * 180) / Math.PI}deg`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </span>
    </span>
  );
}
