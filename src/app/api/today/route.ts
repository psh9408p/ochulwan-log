import { NextResponse } from "next/server";
import { toAttendanceDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { buildTodaySummary } from "@/lib/today";

export async function GET() {
  const attendanceDate = toAttendanceDate(new Date());

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true, attendanceDate, completed: [], pending: [] });
  }

  const [members, records] = await Promise.all([
    prisma.member.findMany({
      where: { isActive: true },
      orderBy: { displayName: "asc" },
    }),
    prisma.attendanceRecord.findMany({
      where: { attendanceDate },
      include: { member: true },
      orderBy: { dailyRank: "asc" },
    }),
  ]);

  const summary = buildTodaySummary({
    members: members.map((member) => ({
      id: member.id,
      displayName: member.displayName,
    })),
    records: records.map((record) => ({
      memberId: record.memberId,
      displayName: record.member.displayName,
      checkedInAt: record.checkedInAt,
      dailyRank: record.dailyRank,
      title: record.title,
    })),
  });

  return NextResponse.json({ ok: true, attendanceDate, ...summary });
}