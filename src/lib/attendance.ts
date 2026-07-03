import { formatKoreanTime, toAttendanceDate } from "./date";
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
          message: `${input.displayName}님은 이미 ${formatKoreanTime(
            duplicate.checkedInAt,
          )}에 오출완했습니다.`,
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
        message: `${input.displayName}님 오늘 ${dailyRank}번째 오출완, ${formatKoreanTime(
          input.now,
        )} 도장 완료. 오늘의 칭호: ${title}`,
      };
    },
  };
}