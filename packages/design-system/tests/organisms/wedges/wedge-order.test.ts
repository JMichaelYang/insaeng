import { describe, expect, it } from "vitest";

import { orderWedges } from "../../../src/organisms/wedges/wedge-order";

const sides = [
  ["about", "sports", "interests", "dreams"],
  ["mission", "resume", "projects", "contact"],
] as const;

describe("orderWedges", () => {
  it("keeps the sides as given in a row", () => {
    expect(orderWedges(sides, "row", 4)).toEqual([
      ["about", "sports", "interests", "dreams"],
      ["mission", "resume", "projects", "contact"],
    ]);
  });

  it("keeps every wedge in its quadrant in a column", () => {
    expect(orderWedges(sides, "column", 4)).toEqual([
      ["sports", "about", "mission", "resume"],
      ["interests", "dreams", "contact", "projects"],
    ]);
  });

  it("keeps the clockwise order in a column", () => {
    const clockwise = (top: unknown[], bottom: unknown[]) => [
      ...top,
      ...bottom.toReversed(),
    ];
    const [left, right] = orderWedges(sides, "row", 4);
    const [top, bottom] = orderWedges(sides, "column", 4);
    const desktop = clockwise(right, left);
    const mobile = clockwise(top, bottom);
    const start = desktop.indexOf(mobile[0]);
    expect([...desktop.slice(start), ...desktop.slice(0, start)]).toEqual(
      mobile,
    );
  });

  it("handles an odd number of wedges", () => {
    expect(
      orderWedges(
        [
          ["a", "b", "c"],
          ["d", "e", "f"],
        ],
        "column",
        3,
      ),
    ).toEqual([
      ["a", "d", "e"],
      ["b", "c", "f"],
    ]);
  });

  it("pads uneven sides with gaps", () => {
    expect(orderWedges([["a"], ["b", "c"]], "column", 2)).toEqual([
      ["a", "b"],
      [undefined, "c"],
    ]);
  });
});
