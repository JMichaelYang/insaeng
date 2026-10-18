"use client";

import {
  createContext,
  use,
  useMemo,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { mergeClasses } from "../../utils/merge-classes";
import { useWedgeFrame } from "./wedge-frame";
import {
  wedgeGeometry,
  type WedgeGeometry,
  type WedgeGeometryOptions,
} from "./wedge-geometry";
import { wedgeKey } from "./wedge-hit-test";
import { useWedgeInteraction } from "./wedge-interaction";
import { blend, useWedgeExpansion } from "./wedge-motion";
import type { ImageBlur, ImageSource } from "../../atoms/image";
import { Wedge, WedgeLines, WedgeSlot } from "../../molecules/wedge";

export type WedgesLayout = Omit<
  WedgeGeometryOptions,
  "width" | "height" | "orientation" | "expansion" | "wedgesPerSide"
>;

export type WedgeItem = {
  content?: ReactNode;
  image?: ImageSource;
  href?: string;
};

export type WedgesSides = readonly [readonly WedgeItem[], readonly WedgeItem[]];

type WedgeTargetProps = HTMLAttributes<HTMLElement> & { href?: string };

export type WedgesLinks = {
  component: ElementType<WedgeTargetProps & { href: string }>;
  navigate: (href: string) => void;
};

const CenterContext = createContext<WedgeGeometry["center"]>(null);

export function WedgesCenter({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const center = use(CenterContext);
  return (
    <div
      className={mergeClasses("relative", className)}
      style={
        center
          ? { width: center.bounds.width, height: center.bounds.height }
          : undefined
      }
    >
      <div
        className="flex size-full items-center justify-center"
        style={center ? { clipPath: `path("${center.path}")` } : undefined}
      >
        {children}
      </div>
      {center && (
        <WedgeLines
          path={center.path}
          lines={center.lines}
          className="overflow-visible"
        />
      )}
    </div>
  );
}

export function Wedges({
  row,
  column,
  sides,
  links,
  blur,
  tilt = false,
  className,
  children,
}: {
  row: WedgesLayout;
  column: WedgesLayout;
  sides: WedgesSides;
  links?: WedgesLinks;
  blur?: ImageBlur;
  tilt?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useWedgeFrame(ref);
  const interaction = useWedgeInteraction(ref, links?.navigate);
  const expansion = useWedgeExpansion(interaction.active, ref);

  const layout = frame?.orientation === "row" ? row : column;
  const wedgesPerSide = Math.max(sides[0].length, sides[1].length);

  const rest = useMemo(() => {
    if (!frame || frame.width <= 0 || frame.height <= 0) return null;
    return wedgeGeometry({ ...layout, ...frame, wedgesPerSide });
  }, [frame, layout, wedgesPerSide]);

  const geometry = useMemo(() => {
    if (!frame || !rest || expansion.size === 0) return rest;
    const [first, second] = [0, 1].map((s) =>
      Array.from(
        { length: wedgesPerSide },
        (_, i) => expansion.get(wedgeKey(s, i)) ?? 0,
      ),
    );
    return wedgeGeometry({
      ...layout,
      ...frame,
      wedgesPerSide,
      expansion: [first, second],
    });
  }, [frame, layout, wedgesPerSide, rest, expansion]);

  const stack = [...expansion.keys()];
  const center = frame ? rest?.center : null;

  return (
    <div
      ref={ref}
      className={mergeClasses("relative flex items-center justify-center", className)}
      onPointerMove={(event) => interaction.hover(event, rest, geometry)}
      onPointerLeave={interaction.leave}
    >
      {frame &&
        geometry?.sides.map((side, s) =>
          side.wedges.map((wedge, i) => {
            const key = wedgeKey(s, i);
            const rank = stack.indexOf(key);
            const resting = rest?.sides[s].wedges[i] ?? wedge;
            const e = expansion.get(key) ?? 0;
            const slot = blend(
              resting.slot,
              rest?.sides[s].expandedSlot ?? null,
              e,
            );
            const item: WedgeItem = sides[s][i] ?? {};
            const { content, image, href } = item;
            const Element = (
              links && href ? links.component : "div"
            ) as ElementType<WedgeTargetProps>;
            return (
              <Element
                key={key}
                href={href}
                tabIndex={href ? undefined : 0}
                draggable={href ? false : undefined}
                className="
                  pointer-events-none absolute inset-0 outline-none select-none
                "
                style={{
                  WebkitTouchCallout: "none",
                  zIndex: rank < 0 ? undefined : rank + 1,
                }}
                {...interaction.target(key, href)}
              >
                <Wedge
                  path={wedge.path}
                  lines={wedge.lines}
                  image={image}
                  bounds={wedge.bounds}
                  blur={blur}
                  fade={geometry.cutRadius}
                  focused={interaction.focused === key}
                  className="pointer-events-auto"
                />
                {slot && content != null && (
                  <WedgeSlot
                    slot={slot}
                    tilt={tilt ? resting.tilt * (1 - e) : undefined}
                  >
                    {content}
                  </WedgeSlot>
                )}
              </Element>
            );
          }),
        )}
      <div
        className="
          pointer-events-none absolute inset-0 flex items-center justify-center
        "
      >
        <div className="pointer-events-auto">
          <CenterContext value={center ?? null}>{children}</CenterContext>
        </div>
      </div>
    </div>
  );
}
