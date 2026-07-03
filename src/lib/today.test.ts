import { describe, expect, it } from "vitest";
import { buildTodaySummary } from "./today";

describe("buildTodaySummary", () => {
  it("splits checked-in and not-yet-checked-in members", () => {
    const summary = buildTodaySummary({
      members: [
        { id: "1", displayName: "수진" },
        { id: "2", displayName: "지훈" },
      ],
      records: [
        {
          memberId: "1",
          displayName: "수진",
          checkedInAt: new Date("2026-07-03T08:21:00+09:00"),
          dailyRank: 1,
          title: "모닝 생존자",
        },
      ],
    });

    expect(summary.completed).toHaveLength(1);
    expect(summary.pending).toEqual([{ id: "2", displayName: "지훈" }]);
  });
});