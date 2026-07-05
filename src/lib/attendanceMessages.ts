import { formatKoreanTime } from "./date";

const WORKDAY_TOTAL_HOURS = 9;
const COUNTDOWN_DRAMA_THRESHOLD_MINUTES = 180;

type CreatedMessageInput = {
  displayName: string;
  dailyRank: number;
  checkedInAt: Date;
  now: Date;
  title: string;
};

type DuplicateMessageInput = {
  displayName: string;
  checkedInAt: Date;
  now: Date;
};

export function buildCreatedAttendanceMessage(input: CreatedMessageInput) {
  return [
    `${input.displayName}님 오늘 ${input.dailyRank}번째 오출완!`,
    `${formatKoreanTime(input.checkedInAt)} 현장 완료. 오늘의 칭호: ${input.title}.`,
    buildLeaveCountdownLine(input.checkedInAt, input.now),
    "출근 버튼 누른 손가락, 오늘 제일 성실합니다.",
  ].join("\n");
}

export function buildDuplicateAttendanceMessage(input: DuplicateMessageInput) {
  return [
    `${input.displayName}님은 이미 ${formatKoreanTime(input.checkedInAt)}에 오출완했습니다.`,
    buildLeaveCountdownLine(input.checkedInAt, input.now),
    "출근 도장은 하루 한 번, 명예는 계속됩니다.",
  ].join("\n");
}

function buildLeaveCountdownLine(checkedInAt: Date, now: Date) {
  const leaveAt = getExpectedLeaveTime(checkedInAt);
  const remainingMinutes = Math.max(
    0,
    Math.ceil((leaveAt.getTime() - now.getTime()) / 1000 / 60),
  );
  const base = `예상 퇴근은 ${formatKoreanTime(leaveAt)}. 퇴근까지 ${formatRemainingMinutes(
    remainingMinutes,
  )}.`;

  if (remainingMinutes === 0) {
    return `${base} 이론상 자유의 문이 열렸습니다.`;
  }

  if (remainingMinutes <= COUNTDOWN_DRAMA_THRESHOLD_MINUTES) {
    return `${base} 이제 시계랑 눈싸움 시작해도 합법입니다.`;
  }

  return `${base} 아직 영혼은 회사 소유입니다.`;
}

function getExpectedLeaveTime(checkedInAt: Date) {
  return new Date(checkedInAt.getTime() + WORKDAY_TOTAL_HOURS * 60 * 60 * 1000);
}

function formatRemainingMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes}분`;
}
