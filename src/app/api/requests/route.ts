import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckinRequest } from "@/lib/requests";
import { sendTelegramMessage } from "@/lib/telegram/client";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    requesterId: string;
    targetId: string;
  };

  const [requester, target] = await Promise.all([
    prisma.member.findUnique({ where: { id: body.requesterId } }),
    prisma.member.findUnique({ where: { id: body.targetId } }),
  ]);

  if (!requester || !target) {
    return NextResponse.json({ ok: false, error: "member_not_found" }, { status: 404 });
  }

  const result = await createCheckinRequest({
    prisma,
    requesterId: requester.id,
    targetId: target.id,
    source: "web",
    now: new Date(),
  });

  if (result.status === "rate_limited") {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  await sendTelegramMessage({
    chatId: process.env.TELEGRAM_CHAT_ID ?? "",
    text: `${requester.displayName}님이 ${target.displayName}님에게 ㅇㅊㅇ을 요청했습니다.`,
  });

  return NextResponse.json({ ok: true });
}