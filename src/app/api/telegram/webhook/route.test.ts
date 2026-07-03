import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertTelegramMember = vi.fn();
const findMemberByDisplayName = vi.fn();
const checkInWithPrisma = vi.fn();
const createCheckinRequest = vi.fn();
const sendTelegramMessage = vi.fn();

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/members", () => ({ upsertTelegramMember, findMemberByDisplayName }));
vi.mock("@/lib/attendance", () => ({ checkInWithPrisma }));
vi.mock("@/lib/requests", () => ({ createCheckinRequest }));
vi.mock("@/lib/telegram/client", () => ({ sendTelegramMessage }));

describe("telegram webhook", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.TELEGRAM_CHAT_ID = "100";
    process.env.TELEGRAM_WEBHOOK_SECRET = "secret";
    upsertTelegramMember.mockResolvedValue({ id: "member-1", displayName: "수진" });
    findMemberByDisplayName.mockResolvedValue({ id: "member-2", displayName: "지훈" });
    checkInWithPrisma.mockResolvedValue({ status: "created", message: "수진님 오출완!" });
    createCheckinRequest.mockResolvedValue({ status: "created" });
  });

  it("creates a check-in from ㅇㅊㅇ message and sends a reply", async () => {
    const { POST } = await import("./route");
    const request = createTelegramRequest("ㅇㅊㅇ");

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
      text: "수진님 오출완!",
    });
  });

  it("registers a member from /등록 command", async () => {
    const { POST } = await import("./route");
    const request = createTelegramRequest("/등록");

    const response = await POST(request);
    const body = await response.json();

    expect(body).toEqual({ ok: true });
    expect(sendTelegramMessage).toHaveBeenCalledWith({
      chatId: "100",
      text: "수진님 등록 완료. 이제 ㅇㅊㅇ 준비 끝!",
    });
  });

  it("creates a check-in request from /요청 command", async () => {
    const { POST } = await import("./route");
    const request = createTelegramRequest("/요청 지훈");

    const response = await POST(request);
    const body = await response.json();

    expect(body).toEqual({ ok: true, status: "created" });
    expect(findMemberByDisplayName).toHaveBeenCalledWith(expect.anything(), "지훈");
    expect(createCheckinRequest).toHaveBeenCalledWith({
      prisma: expect.anything(),
      requesterId: "member-1",
      targetId: "member-2",
      source: "telegram",
      now: expect.any(Date),
    });
    expect(sendTelegramMessage).toHaveBeenCalledWith({
      chatId: "100",
      text: "수진님이 지훈님에게 ㅇㅊㅇ을 요청했습니다.",
    });
  });
});

function createTelegramRequest(text: string) {
  return new Request("http://localhost/api/telegram/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-telegram-bot-api-secret-token": "secret",
    },
    body: JSON.stringify({
      message: {
        text,
        chat: { id: 100 },
        from: { id: 7, username: "sujin", first_name: "수진" },
      },
    }),
  });
}
