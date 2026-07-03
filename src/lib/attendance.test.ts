import { describe, expect, it } from "vitest";
import { createAttendanceService } from "./attendance";

describe("attendance service", () => {
  it("creates first check-in and assigns rank 1", async () => {
    const service = createAttendanceService();

    const result = await service.checkIn({
      memberId: "member-1",
      displayName: "수진",
      now: new Date("2026-07-03T08:21:00+09:00"),
    });

    expect(result.status).toBe("created");
    expect(result.record.dailyRank).toBe(1);
    expect(result.message).toContain("수진님 오늘 1번째 오출완!");
  });

  it("does not create duplicate same-day check-in", async () => {
    const service = createAttendanceService();
    const now = new Date("2026-07-03T08:21:00+09:00");

    await service.checkIn({ memberId: "member-1", displayName: "수진", now });
    const duplicate = await service.checkIn({
      memberId: "member-1",
      displayName: "수진",
      now: new Date("2026-07-03T09:21:00+09:00"),
    });

    expect(duplicate.status).toBe("duplicate");
    expect(duplicate.message).toContain("수진님은 이미");
    expect(service.records).toHaveLength(1);
  });
});
