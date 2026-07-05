import { formatKoreanTime } from "./date";

type CreatedMessageInput = {
  displayName: string;
  dailyRank: number;
  checkedInAt: Date;
  title: string;
};

type DuplicateMessageInput = {
  displayName: string;
  checkedInAt: Date;
};

export function buildCreatedAttendanceMessage(input: CreatedMessageInput) {
  return [
    `${input.displayName}님 오늘 ${input.dailyRank}번째 오출완!`,
    `${formatKoreanTime(input.checkedInAt)} 현장 완료. 오늘의 칭호: ${input.title}.`,
    "출근 버튼 누른 손가락, 오늘 제일 성실합니다.",
  ].join("\n");
}

export function buildDuplicateAttendanceMessage(input: DuplicateMessageInput) {
  return [
    `${input.displayName}님은 이미 ${formatKoreanTime(input.checkedInAt)}에 오출완했습니다.`,
    "출근 도장은 하루 한 번, 명예는 계속됩니다.",
  ].join("\n");
}
