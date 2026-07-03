import { NextResponse } from "next/server";
import { checkInWithPrisma } from "@/lib/attendance";
import { upsertTelegramMember } from "@/lib/members";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram/client";
import { parseTelegramText } from "@/lib/telegram/parser";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat: { id: number | string };
    from?: {
      id: number | string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
};

function displayNameFromUser(user: NonNullable<TelegramUpdate["message"]>["from"]) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  return name || user?.username || String(user?.id);
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  const configuredChatId = process.env.TELEGRAM_CHAT_ID;

  if (!message?.from || !message.text || String(message.chat.id) !== configuredChatId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const parsed = parseTelegramText(message.text);
  if (parsed.type === "unknown") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const member = await upsertTelegramMember(prisma, {
    telegramUserId: String(message.from.id),
    telegramUsername: message.from.username,
    displayName: displayNameFromUser(message.from),
  });

  if (parsed.type === "register") {
    await sendTelegramMessage({
      chatId: configuredChatId,
      text: `${member.displayName}님 등록 완료. 이제 ㅇㅊㅇ 준비 끝.`,
    });
    return NextResponse.json({ ok: true });
  }

  if (parsed.type === "checkin") {
    const result = await checkInWithPrisma(prisma, {
      memberId: member.id,
      displayName: member.displayName,
      now: new Date(),
    });

    await sendTelegramMessage({ chatId: configuredChatId, text: result.message });
    return NextResponse.json({ ok: true, status: result.status });
  }

  return NextResponse.json({ ok: true });
}