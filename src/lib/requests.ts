import type { PrismaClient } from "@prisma/client";

const REQUEST_COOLDOWN_MS = 30 * 60 * 1000;

export function canRequestAgain(lastRequestedAt: Date | null, now: Date) {
  if (!lastRequestedAt) {
    return true;
  }

  return now.getTime() - lastRequestedAt.getTime() >= REQUEST_COOLDOWN_MS;
}

export async function createCheckinRequest(input: {
  prisma: PrismaClient;
  requesterId: string;
  targetId: string;
  source: "web" | "telegram";
  now: Date;
}) {
  const lastRequest = await input.prisma.checkinRequest.findFirst({
    where: { targetId: input.targetId },
    orderBy: { requestedAt: "desc" },
  });

  if (!canRequestAgain(lastRequest?.requestedAt ?? null, input.now)) {
    return { status: "rate_limited" as const };
  }

  const request = await input.prisma.checkinRequest.create({
    data: {
      requesterId: input.requesterId,
      targetId: input.targetId,
      source: input.source,
      requestedAt: input.now,
    },
  });

  return { status: "created" as const, request };
}