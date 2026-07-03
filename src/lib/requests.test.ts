import { describe, expect, it } from "vitest";
import { canRequestAgain } from "./requests";

describe("canRequestAgain", () => {
  it("blocks requests within 30 minutes", () => {
    const last = new Date("2026-07-03T08:00:00+09:00");
    const now = new Date("2026-07-03T08:20:00+09:00");

    expect(canRequestAgain(last, now)).toBe(false);
  });

  it("allows requests after 30 minutes", () => {
    const last = new Date("2026-07-03T08:00:00+09:00");
    const now = new Date("2026-07-03T08:31:00+09:00");

    expect(canRequestAgain(last, now)).toBe(true);
  });
});