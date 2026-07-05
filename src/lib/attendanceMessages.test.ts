import { describe, expect, it } from "vitest";
import {
  buildCreatedAttendanceMessage,
  buildDuplicateAttendanceMessage,
} from "./attendanceMessages";

describe("attendance messages", () => {
  it("uses each person's check-in time to calculate a 9-hour leave time", () => {
    const message = buildCreatedAttendanceMessage({
      displayName: "수진",
      dailyRank: 1,
      checkedInAt: new Date("2026-07-06T08:37:00+09:00"),
      now: new Date("2026-07-06T08:37:00+09:00"),
      title: "커피 전사",
    });

    expect(message).toContain("예상 퇴근은 17:37");
    expect(message).toContain("퇴근까지 9시간 0분");
  });

  it("gets extra dramatic when there are less than 3 hours left", () => {
    const message = buildDuplicateAttendanceMessage({
      displayName: "수진",
      checkedInAt: new Date("2026-07-06T08:37:00+09:00"),
      now: new Date("2026-07-06T14:45:00+09:00"),
    });

    expect(message).toContain("예상 퇴근은 17:37");
    expect(message).toContain("퇴근까지 2시간 52분");
    expect(message).toContain("시계랑 눈싸움");
  });
});
