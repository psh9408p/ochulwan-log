import type { ParsedTelegramText } from "./types";

export function parseTelegramText(text: string | undefined): ParsedTelegramText {
  const normalized = text?.trim();

  if (!normalized) {
    return { type: "unknown" };
  }

  if (normalized === "ㅇㅊㅇ") {
    return { type: "checkin" };
  }

  if (normalized === "/등록") {
    return { type: "register" };
  }

  const requestMatch = normalized.match(/^\/요청\s+(.+)$/);
  if (requestMatch?.[1]) {
    return { type: "request", targetName: requestMatch[1].trim() };
  }

  return { type: "unknown" };
}
