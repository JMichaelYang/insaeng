import { useId } from "react";

const strokeWidth = 2;

export function Wedge({ path }: { path: string }) {
  const id = useId();
  return (
    <g>
      <clipPath id={id}>
        <path d={path} />
      </clipPath>
      <path className="fill-surface-container-lowest" d={path} />
      <path
        className="fill-none stroke-outline"
        d={path}
        strokeWidth={strokeWidth * 2}
        clipPath={`url(#${id})`}
      />
    </g>
  );
}
