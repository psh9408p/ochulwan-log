import { describe, expect, it } from "vitest";
import { parseTelegramText } from "./parser";

describe("parseTelegramText", () => {
  it("detects check-in message", () => {
    expect(parseTelegramText("ㅇㅊㅇ")).toEqual({ type: "checkin" });
    expect(parseTelegramText("  ㅇㅊㅇ  ")).toEqual({ type: "checkin" });
  });

  it("detects registration command", () => {
    expect(parseTelegramText("/등록")).toEqual({ type: "register" });
  });

  it("detects request command", () => {
    expect(parseTelegramText("/요청 지훈")).toEqual({
      type: "request",
      targetName: "지훈",
    });
  });

  it("ignores unknown text", () => {
    expect(parseTelegramText("출근합니다")).toEqual({ type: "unknown" });
  });
});