import type { PrismaClient } from "@prisma/client";
import { formatKoreanTime, toAttendanceDate } from "./date";
import { sendTelegramMessage } from "./telegram/client";

export type LeaveReminderStage = "three_hours" | "two_hours" | "one_hour" | "leave_time";

const WORKDAY_TOTAL_HOURS = 9;
const REMINDER_STAGES: Array<{ stage: LeaveReminderStage; minutesBeforeLeave: number }> = [
  { stage: "three_hours", minutesBeforeLeave: 180 },
  { stage: "two_hours", minutesBeforeLeave: 120 },
  { stage: "one_hour", minutesBeforeLeave: 60 },
  { stage: "leave_time", minutesBeforeLeave: 0 },
];

export function getDueLeaveReminderStages(input: {
  checkedInAt: Date;
  now: Date;
  sentStages: LeaveReminderStage[];
}) {
  const leaveAt = getExpectedLeaveTime(input.checkedInAt);
  const sentStages = new Set(input.sentStages);

  return REMINDER_STAGES.filter(({ stage, minutesBeforeLeave }) => {
    const sendAt = new Date(leaveAt.getTime() - minutesBeforeLeave * 60 * 1000);
    return input.now >= sendAt && !sentStages.has(stage);
  }).map(({ stage }) => stage);
}

export function buildLeaveReminderMessage(input: {
  displayName: string;
  checkedInAt: Date;
  stage: LeaveReminderStage;
}) {
  const leaveAt = getExpectedLeaveTime(input.checkedInAt);

  if (input.stage === "leave_time") {
    return [
      `${input.displayName}님 퇴근 예정 시각 ${formatKoreanTime(leaveAt)} 도착.`,
      "오늘의 노동 서사는 여기까지. 수고했습니다.",
    ].join("\n");
  }

  const remainingHours = {
    three_hours: 3,
    two_hours: 2,
    one_hour: 1,
  }[input.stage];

  const stageLine = {
    three_hours: "슬슬 키보드 소리가 퇴근 행진곡으로 들릴 시간입니다.",
    two_hours: "이제 집중력과 퇴근 욕망이 정면 충돌하는 구간입니다.",
    one_hour: "이제 마음은 이미 엘리베이터 앞입니다.",
  }[input.stage];

  return [
    `${input.displayName}님 퇴근까지 ${remainingHours}시간.`,
    `예상 퇴근은 ${formatKoreanTime(leaveAt)}입니다.`,
    stageLine,
  ].join("\n");
}

export async function sendDueLeaveReminders(input: {
  prisma: PrismaClient;
  now: Date;
  chatId: string;
}) {
  const attendanceDate = toAttendanceDate(input.now);
  const records = await input.prisma.attendanceRecord.findMany({
    where: { attendanceDate },
    include: { member: true, leaveReminders: true },
    orderBy: { checkedInAt: "asc" },
  });
  let sentCount = 0;

  for (const record of records) {
    const sentStages = record.leaveReminders.map(
      (reminder) => reminder.stage as LeaveReminderStage,
    );
    const dueStages = getDueLeaveReminderStages({
      checkedInAt: record.checkedInAt,
      now: input.now,
      sentStages,
    });

    for (const stage of dueStages) {
      await sendTelegramMessage({
        chatId: input.chatId,
        text: buildLeaveReminderMessage({
          displayName: record.member.displayName,
          checkedInAt: record.checkedInAt,
          stage,
        }),
      });
      await input.prisma.leaveReminder.create({
        data: {
          attendanceRecordId: record.id,
          stage,
          sentAt: input.now,
        },
      });
      sentCount += 1;
    }
  }

  return { sentCount };
}

function getExpectedLeaveTime(checkedInAt: Date) {
  return new Date(checkedInAt.getTime() + WORKDAY_TOTAL_HOURS * 60 * 60 * 1000);
}
