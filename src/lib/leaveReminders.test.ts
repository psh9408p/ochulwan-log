import { describe, expect, it } from "vitest";
import {
  buildLeaveReminderMessage,
  getDueLeaveReminderStages,
  type LeaveReminderStage,
} from "./leaveReminders";

describe("leave reminders", () => {
  const checkedInAt = new Date("2026-07-06T08:37:00+09:00");

  it("does not return reminders before the 3-hour countdown starts", () => {
    expect(
      getDueLeaveReminderStages({
        checkedInAt,
        now: new Date("2026-07-06T14:36:00+09:00"),
        sentStages: [],
      }),
    ).toEqual([]);
  });

  it("returns hourly reminder stages from 3 hours before leave time", () => {
    const cases: Array<[string, LeaveReminderStage]> = [
      ["2026-07-06T14:37:00+09:00", "three_hours"],
      ["2026-07-06T15:37:00+09:00", "two_hours"],
      ["2026-07-06T16:37:00+09:00", "one_hour"],
      ["2026-07-06T17:37:00+09:00", "leave_time"],
    ];

    for (const [now, expectedStage] of cases) {
      expect(
        getDueLeaveReminderStages({
          checkedInAt,
          now: new Date(now),
          sentStages: [],
        }),
      ).toContain(expectedStage);
    }
  });

  it("does not return stages that were already sent", () => {
    expect(
      getDueLeaveReminderStages({
        checkedInAt,
        now: new Date("2026-07-06T17:37:00+09:00"),
        sentStages: ["three_hours", "two_hours", "one_hour", "leave_time"],
      }),
    ).toEqual([]);
  });

  it("builds playful leave reminder messages", () => {
    expect(
      buildLeaveReminderMessage({
        displayName: "수진",
        checkedInAt,
        stage: "one_hour",
      }),
    ).toContain("수진님 퇴근까지 1시간");
  });
});
