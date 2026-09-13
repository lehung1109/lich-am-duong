import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Smoke Test", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2", "py-1", { "bg-red-500": true, "hidden": false })).toBe(
      "px-2 py-1 bg-red-500"
    );
  });
});
