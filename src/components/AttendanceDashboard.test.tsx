import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttendanceDashboard } from "./AttendanceDashboard";

describe("AttendanceDashboard", () => {
  it("renders completed and pending members", () => {
    render(
      <AttendanceDashboard
        completed={[
          {
            memberId: "1",
            displayName: "수진",
            checkedInAt: new Date("2026-07-03T08:21:00+09:00"),
            dailyRank: 1,
            title: "모닝 생존자",
          },
        ]}
        pending={[{ id: "2", displayName: "지훈" }]}
        requesterId="1"
      />,
    );

    expect(screen.getByRole("heading", { name: "오늘 1명 오출완" })).toBeDefined();
    expect(screen.getAllByText(/수진/).length).toBeGreaterThan(0);
    expect(screen.getByText("지훈")).toBeDefined();
    expect(screen.getByRole("button", { name: "ㅇㅊㅇ 요청" })).toBeDefined();
  });
});