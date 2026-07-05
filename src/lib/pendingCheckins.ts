import type { PrismaClient } from "@prisma/client";
import { toAttendanceDate } from "./date";

export function buildPendingCheckinRoast(displayNames: string[]) {
  if (displayNames.length === 0) {
    return "";
  }

  const names = displayNames.join(", ");
  const calledNames = displayNames.map((name) => `${name}님`).join(" ");

  return [
    `아직 안 찍은 사람: ${names}`,
    `${calledNames}, 혹시 출근은 마음으로만 하셨나요? ㅇㅊㅇ 안 합니까?`,
  ].join("\n");
}

export async function getPendingCheckinRoast(input: {
  prisma: PrismaClient;
  currentMemberId: string;
  now: Date;
}) {
  const attendanceDate = toAttendanceDate(input.now);
  const [members, records] = await Promise.all([
    input.prisma.member.findMany({
      where: { isActive: true },
      orderBy: { displayName: "asc" },
    }),
    input.prisma.attendanceRecord.findMany({
      where: { attendanceDate },
      select: { memberId: true },
    }),
  ]);
  const completedMemberIds = new Set(records.map((record) => record.memberId));
  const pendingNames = members
    .filter((member) => member.id !== input.currentMemberId)
    .filter((member) => !completedMemberIds.has(member.id))
    .map((member) => member.displayName);

  return buildPendingCheckinRoast(pendingNames);
}
