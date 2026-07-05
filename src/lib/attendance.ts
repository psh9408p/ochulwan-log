import type { PrismaClient } from "@prisma/client";
import {
  buildCreatedAttendanceMessage,
  buildDuplicateAttendanceMessage,
} from "./attendanceMessages";
import { toAttendanceDate } from "./date";
import { pickTitle } from "./titles";

export type AttendanceRecordView = {
  memberId: string;
  displayName: string;
  attendanceDate: Date;
  checkedInAt: Date;
  dailyRank: number;
  title: string;
};

export type CheckInInput = {
  memberId: string;
  displayName: string;
  now: Date;
};

export function createAttendanceService() {
  const records: AttendanceRecordView[] = [];

  return {
    records,
    async checkIn(input: CheckInInput) {
      const attendanceDate = toAttendanceDate(input.now);
      const duplicate = records.find(
        (record) =>
          record.memberId === input.memberId &&
          record.attendanceDate.getTime() === attendanceDate.getTime(),
      );

      if (duplicate) {
        return {
          status: "duplicate" as const,
          record: duplicate,
          message: buildDuplicateAttendanceMessage({
            displayName: input.displayName,
            checkedInAt: duplicate.checkedInAt,
          }),
        };
      }

      const dailyRank =
        records.filter((record) => record.attendanceDate.getTime() === attendanceDate.getTime())
          .length + 1;
      const title = pickTitle(`${input.memberId}-${attendanceDate.toISOString()}`);
      const record: AttendanceRecordView = {
        memberId: input.memberId,
        displayName: input.displayName,
        attendanceDate,
        checkedInAt: input.now,
        dailyRank,
        title,
      };

      records.push(record);

      return {
        status: "created" as const,
        record,
        message: buildCreatedAttendanceMessage({
          displayName: input.displayName,
          dailyRank,
          checkedInAt: input.now,
          title,
        }),
      };
    },
  };
}

export async function checkInWithPrisma(prisma: PrismaClient, input: CheckInInput) {
  const attendanceDate = toAttendanceDate(input.now);
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      memberId_attendanceDate: {
        memberId: input.memberId,
        attendanceDate,
      },
    },
  });

  if (existing) {
    return {
      status: "duplicate" as const,
      record: existing,
      message: buildDuplicateAttendanceMessage({
        displayName: input.displayName,
        checkedInAt: existing.checkedInAt,
      }),
    };
  }

  const dailyRank = (await prisma.attendanceRecord.count({ where: { attendanceDate } })) + 1;
  const title = pickTitle(`${input.memberId}-${attendanceDate.toISOString()}`);
  const record = await prisma.attendanceRecord.create({
    data: {
      memberId: input.memberId,
      attendanceDate,
      checkedInAt: input.now,
      dailyRank,
      title,
    },
  });

  return {
    status: "created" as const,
    record,
    message: buildCreatedAttendanceMessage({
      displayName: input.displayName,
      dailyRank,
      checkedInAt: input.now,
      title,
    }),
  };
}
