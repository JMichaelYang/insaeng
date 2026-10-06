import { describe, expect, it } from "vitest";

import { mergeClasses } from "../../src/utils/merge-classes";

describe("mergeClasses", () => {
  it("joins truthy class values", () => {
    expect(mergeClasses("p-4", false, undefined, ["text-on-surface"])).toBe(
      "p-4 text-on-surface",
    );
  });

  it("keeps the last of conflicting token classes", () => {
    expect(mergeClasses("bg-surface", "bg-primary")).toBe("bg-primary");
    expect(mergeClasses("h-control-sm", "h-control-lg")).toBe("h-control-lg");
  });

  it("lets a type style override font size and weight", () => {
    expect(mergeClasses("text-sm font-bold", "type-body-md")).toBe("type-body-md");
  });
});
