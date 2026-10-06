import type { ReactNode } from "react";

import { mergeClasses } from "../utils/merge-classes";

export type NotchSide = "top" | "right" | "bottom" | "left";

export type Notch = {
  radius: number;
  fillet: number;
  offset: number;
};

function notchShape({ radius, fillet, offset }: Notch) {
  const reach = Math.sqrt((radius + fillet) ** 2 - (offset + fillet) ** 2);
  const width = radius - offset + 4;
  const height = 2 * Math.ceil(reach) + 8;
  const cy = height / 2;
  const center = { x: width + offset, y: cy };

  const edge = (inset: number) => {
    const x = width - inset;
    const tangent = (sign: number) => {
      const scale = (radius + inset) / (radius + fillet);
      const fx = width - fillet;
      const fy = cy + sign * reach;
      return `${center.x + (fx - center.x) * scale} ${center.y + (fy - center.y) * scale}`;
    };
    const f = fillet - inset;
    const r = radius + inset;
    return [
      `L ${x} ${cy - reach}`,
      `A ${f} ${f} 0 0 1 ${tangent(-1)}`,
      `A ${r} ${r} 0 0 0 ${tangent(1)}`,
      `A ${f} ${f} 0 0 1 ${x} ${cy + reach}`,
      `L ${x} ${height}`,
    ].join(" ");
  };

  return {
    width,
    height,
    fill: `M 0 0 L ${width} 0 ${edge(0)} L 0 ${height} Z`,
    stroke: `M ${width - 1} 0 ${edge(1)}`,
  };
}

const transforms: Record<NotchSide, (w: number) => string> = {
  right: () => "matrix(1 0 0 1 0 0)",
  left: (w) => `matrix(-1 0 0 1 ${w} 0)`,
  bottom: () => "matrix(0 1 1 0 0 0)",
  top: (w) => `matrix(0 -1 1 0 0 ${w})`,
};

function NotchStrip({ side, notch }: { side: NotchSide; notch: Notch }) {
  const { width, height, fill, stroke } = notchShape(notch);
  const vertical = side === "left" || side === "right";
  const [w, h] = vertical ? [width, height] : [height, width];
  return (
    <svg
      className="block shrink-0"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
    >
      <g transform={transforms[side](width)}>
        <path className="fill-surface-container-lowest" d={fill} />
        <path
          className="fill-none stroke-outline"
          d={stroke}
          strokeWidth={2}
        />
      </g>
    </svg>
  );
}

const layouts: Record<
  NotchSide,
  { root: string; main: string; strip: string; before: string; after: string }
> = {
  right: {
    root: "flex-row",
    main: "rounded-l-2xl border-y-2 border-l-2",
    strip: "flex-col",
    before: "rounded-tr-2xl border-t-2 border-r-2",
    after: "rounded-br-2xl border-r-2 border-b-2",
  },
  left: {
    root: "flex-row-reverse",
    main: "rounded-r-2xl border-y-2 border-r-2",
    strip: "flex-col",
    before: "rounded-tl-2xl border-t-2 border-l-2",
    after: "rounded-bl-2xl border-b-2 border-l-2",
  },
  bottom: {
    root: "flex-col",
    main: "rounded-t-2xl border-x-2 border-t-2",
    strip: "flex-row",
    before: "rounded-bl-2xl border-b-2 border-l-2",
    after: "rounded-br-2xl border-r-2 border-b-2",
  },
  top: {
    root: "flex-col-reverse",
    main: "rounded-b-2xl border-x-2 border-b-2",
    strip: "flex-row",
    before: "rounded-tl-2xl border-t-2 border-l-2",
    after: "rounded-tr-2xl border-t-2 border-r-2",
  },
};

function NotchedBackground({
  side,
  notch,
  className,
}: {
  side: NotchSide;
  notch: Notch;
  className: string;
}) {
  const layout = layouts[side];
  const piece = "flex-1 border-outline bg-surface-container-lowest";
  return (
    <div className={`
      absolute inset-0
      ${className}
      ${layout.root}
    `}>
      <div className={`
        ${piece}
        ${layout.main}
      `} />
      <div className={`
        flex
        ${layout.strip}
      `}>
        <div className={`
          ${piece}
          ${layout.before}
        `} />
        <NotchStrip side={side} notch={notch} />
        <div className={`
          ${piece}
          ${layout.after}
        `} />
      </div>
    </div>
  );
}

export function NotchedPanel({
  mobile,
  desktop,
  className,
  children,
}: {
  mobile: { side: NotchSide; notch: Notch };
  desktop: { side: NotchSide; notch: Notch };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={mergeClasses("relative", className)}>
      <NotchedBackground
        {...mobile}
        className="
          flex
          lg:hidden
        "
      />
      <NotchedBackground
        {...desktop}
        className="
          hidden
          lg:flex
        "
      />
      <div className="relative">{children}</div>
    </section>
  );
}
