export type TodayMember = {
  id: string;
  displayName: string;
};

export type TodayRecord = {
  memberId: string;
  displayName: string;
  checkedInAt: Date;
  dailyRank: number;
  title: string;
};

export function buildTodaySummary(input: {
  members: TodayMember[];
  records: TodayRecord[];
}) {
  const completedMemberIds = new Set(input.records.map((record) => record.memberId));

  return {
    completed: [...input.records].sort((a, b) => a.dailyRank - b.dailyRank),
    pending: input.members.filter((member) => !completedMemberIds.has(member.id)),
  };
}