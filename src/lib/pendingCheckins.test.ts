import { describe, expect, it } from "vitest";
import { buildPendingCheckinRoast } from "./pendingCheckins";

describe("pending check-in roast", () => {
  it("does not roast when nobody is pending", () => {
    expect(buildPendingCheckinRoast([])).toBe("");
  });

  it("roasts pending members by name", () => {
    expect(buildPendingCheckinRoast(["민수", "지훈"])).toBe(
      "아직 안 찍은 사람: 민수, 지훈\n민수님 지훈님, 혹시 출근은 마음으로만 하셨나요? ㅇㅊㅇ 안 합니까?",
    );
  });
});
