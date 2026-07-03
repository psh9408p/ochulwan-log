import type { PrismaClient } from "@prisma/client";

export type TelegramMemberInput = {
  telegramUserId: string;
  telegramUsername?: string;
  displayName: string;
};

export async function upsertTelegramMember(
  prisma: PrismaClient,
  input: TelegramMemberInput,
) {
  return prisma.member.upsert({
    where: { telegramUserId: input.telegramUserId },
    update: {
      telegramUsername: input.telegramUsername,
      displayName: input.displayName,
      isActive: true,
    },
    create: {
      telegramUserId: input.telegramUserId,
      telegramUsername: input.telegramUsername,
      displayName: input.displayName,
    },
  });
}

export async function findMemberByDisplayName(prisma: PrismaClient, displayName: string) {
  return prisma.member.findFirst({
    where: {
      displayName: {
        equals: displayName,
        mode: "insensitive",
      },
      isActive: true,
    },
  });
}