import React from "react";
import { formatKoreanTime } from "@/lib/date";
import { RequestButton } from "./RequestButton";

type Completed = {
  memberId: string;
  displayName: string;
  checkedInAt: Date;
  dailyRank: number;
  title: string;
};

type Pending = {
  id: string;
  displayName: string;
};

export function AttendanceDashboard({
  completed,
  pending,
  requesterId,
}: {
  completed: Completed[];
  pending: Pending[];
  requesterId?: string;
}) {
  const first = completed[0];

  return (
    <main className="dashboard">
      <section className="hero">
        <div>
          <p className="eyebrow">오늘출근완료</p>
          <h1>오늘 {completed.length}명 오출완</h1>
        </div>
        <span className="liveBadge">LIVE</span>
      </section>

      <section className="stats">
        <article>
          <span>첫 출근</span>
          <strong>{first ? `${first.displayName} ${formatKoreanTime(first.checkedInAt)}` : "대기 중"}</strong>
        </article>
        <article>
          <span>미출근</span>
          <strong>{pending.length}명 남음</strong>
        </article>
      </section>

      <div className="columns">
        <section>
          <h2>오출완한 사람</h2>
          <div className="list">
            {completed.map((record) => (
              <article className="row" key={record.memberId}>
                <strong>{record.dailyRank}. {record.displayName}</strong>
                <span>{formatKoreanTime(record.checkedInAt)} · {record.title}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="pendingPanel">
          <h2>아직 안 찍은 사람</h2>
          <div className="list">
            {pending.map((member) => (
              <article className="row" key={member.id}>
                <strong>{member.displayName}</strong>
                {requesterId ? (
                  <RequestButton requesterId={requesterId} targetId={member.id} />
                ) : (
                  <span>등록 멤버 선택 필요</span>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}