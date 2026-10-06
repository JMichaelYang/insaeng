import { describe, expect, it } from "vitest";

import { cn } from "../../src/lib/cn";

describe("cn", () => {
  it("joins truthy class values", () => {
    expect(cn("p-4", false, undefined, ["text-on-surface"])).toBe(
      "p-4 text-on-surface",
    );
  });

  it("keeps the last of conflicting token classes", () => {
    expect(cn("bg-surface", "bg-primary")).toBe("bg-primary");
    expect(cn("h-control-sm", "h-control-lg")).toBe("h-control-lg");
  });

  it("lets a type style override font size and weight", () => {
    expect(cn("text-sm font-bold", "type-body-md")).toBe("type-body-md");
  });
});
