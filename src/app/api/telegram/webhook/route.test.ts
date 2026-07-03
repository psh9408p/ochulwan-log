import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertTelegramMember = vi.fn();
const checkInWithPrisma = vi.fn();
const sendTelegramMessage = vi.fn();

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/members", () => ({ upsertTelegramMember }));
vi.mock("@/lib/attendance", () => ({ checkInWithPrisma }));
vi.mock("@/lib/telegram/client", () => ({ sendTelegramMessage }));

describe("telegram webhook", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.TELEGRAM_CHAT_ID = "100";
    process.env.TELEGRAM_WEBHOOK_SECRET = "secret";
    upsertTelegramMember.mockResolvedValue({ id: "member-1", displayName: "수진" });
    checkInWithPrisma.mockResolvedValue({ status: "created", message: "수진님 오출완" });
  });

  it("creates a check-in from ㅇㅊㅇ message and sends a reply", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/telegram/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-telegram-bot-api-secret-token": "secret",
      },
      body: JSON.stringify({
        message: {
          text: "ㅇㅊㅇ",
          chat: { id: 100 },
          from: { id: 7, username: "sujin", first_name: "수진" },
        },
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body).toEqual({ ok: true, status: "created" });
    expect(upsertTelegramMember).toHaveBeenCalledWith(expect.anything(), {
      telegramUserId: "7",
      telegramUsername: "sujin",
      displayName: "수진",
    });
    expect(checkInWithPrisma).toHaveBeenCalledWith(expect.anything(), {
      memberId: "member-1",
      displayName: "수진",
      now: expect.any(Date),
    });
    expect(sendTelegramMessage).toHaveBeenCalledWith({
      chatId: "100",
      text: "수진님 오출완",
    });
  });
});