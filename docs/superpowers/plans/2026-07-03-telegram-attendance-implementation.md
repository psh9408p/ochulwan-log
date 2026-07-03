# 오출완 텔레그램 출석체크 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 텔레그램 그룹에서 `ㅇㅊㅇ` 메시지를 받아 출근 기록을 저장하고, Next.js 웹 대시보드에서 오늘 출근자와 미출근자를 보여주는 MVP를 만든다.

**Architecture:** Next.js App Router를 풀스택 앱으로 사용한다. Prisma와 PostgreSQL 스키마를 기준으로 도메인 로직을 분리하고, 텔레그램 Webhook Route Handler와 웹 대시보드가 같은 도메인 함수를 사용한다.

**Tech Stack:** Next.js, React, TypeScript, Prisma, PostgreSQL, Vitest, Testing Library, Telegram Bot API

---

## 파일 구조

- `package.json`: 프로젝트 스크립트와 의존성.
- `next.config.ts`: Next.js 설정.
- `tsconfig.json`: TypeScript 설정.
- `vitest.config.ts`: 단위 테스트 설정.
- `.env.example`: 필요한 환경 변수 예시.
- `prisma/schema.prisma`: Prisma 모델 정의.
- `src/app/page.tsx`: 메인 오출완 대시보드.
- `src/app/globals.css`: 전체 스타일.
- `src/app/layout.tsx`: 앱 레이아웃.
- `src/app/api/telegram/webhook/route.ts`: 텔레그램 Webhook 수신.
- `src/app/api/requests/route.ts`: 웹의 `ㅇㅊㅇ 요청` 처리.
- `src/app/api/today/route.ts`: 오늘 출근 상태 JSON 조회.
- `src/components/AttendanceDashboard.tsx`: 대시보드 UI 컴포넌트.
- `src/components/RequestButton.tsx`: 미출근자 요청 버튼.
- `src/lib/prisma.ts`: Prisma Client singleton.
- `src/lib/date.ts`: 로컬 날짜 유틸.
- `src/lib/titles.ts`: 랜덤 칭호 선택.
- `src/lib/telegram/types.ts`: Telegram update 타입.
- `src/lib/telegram/parser.ts`: `ㅇㅊㅇ`, `/등록`, `/요청 이름` 파싱.
- `src/lib/telegram/client.ts`: Telegram Bot API 전송 클라이언트.
- `src/lib/members.ts`: 멤버 등록과 조회.
- `src/lib/attendance.ts`: 출근 체크와 오늘 요약.
- `src/lib/requests.ts`: 요청 생성과 rate limit.
- `src/test/fakes.ts`: 테스트용 in-memory 저장소와 fixture.
- `src/**/*.test.ts`: 도메인 단위 테스트.
- `README.md`: 로컬 실행과 텔레그램 설정 문서.

---

### Task 1: Next.js 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Modify: `.gitignore`

- [ ] **Step 1: npm 프로젝트와 Next.js 의존성 설치**

Run:

```powershell
npm init -y
npm install next react react-dom
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next
```

Expected: `package.json`과 `package-lock.json`이 생성되고 Next.js 실행에 필요한 의존성이 설치된다.

- [ ] **Step 2: 테스트 의존성 설치**

Run:

```powershell
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Expected: `package.json`에 테스트 의존성이 추가된다.

- [ ] **Step 3: Vitest 설정 작성**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
```

- [ ] **Step 4: package scripts 확인**

Modify `package.json`:

```json
{
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Next.js 설정 파일 작성**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: 기본 앱 파일 작성**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오출완",
  description: "텔레그램과 연결되는 오늘출근완료 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return <main>오출완 준비 중</main>;
}
```

Create `src/app/globals.css`:

```css
body {
  margin: 0;
}
```

- [ ] **Step 7: 검증**

Run:

```powershell
npm run test
npm run build
```

Expected: 테스트는 파일이 없어도 통과하고, Next.js 빌드가 성공한다.

- [ ] **Step 8: 커밋**

```powershell
git add package.json package-lock.json next.config.ts tsconfig.json vitest.config.ts src .gitignore
git commit -m "chore: scaffold next app"
```

---

### Task 2: Prisma와 데이터베이스 스키마 추가

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.example`
- Create: `src/lib/prisma.ts`
- Modify: `package.json`

- [ ] **Step 1: Prisma 설치**

Run:

```powershell
npm install @prisma/client
npm install -D prisma
```

Expected: Prisma 의존성이 추가된다.

- [ ] **Step 2: Prisma 스키마 작성**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Member {
  id               String             @id @default(cuid())
  telegramUserId   String             @unique
  telegramUsername String?
  displayName      String
  firstSeenAt      DateTime           @default(now())
  lastSeenAt       DateTime           @updatedAt
  isActive         Boolean            @default(true)
  attendance       AttendanceRecord[]
  sentRequests     CheckinRequest[]   @relation("Requester")
  receivedRequests CheckinRequest[]   @relation("Target")
}

model AttendanceRecord {
  id             String   @id @default(cuid())
  memberId       String
  attendanceDate DateTime
  checkedInAt    DateTime @default(now())
  dailyRank      Int
  title          String
  member         Member   @relation(fields: [memberId], references: [id])

  @@unique([memberId, attendanceDate])
  @@index([attendanceDate, checkedInAt])
}

model CheckinRequest {
  id          String   @id @default(cuid())
  requesterId String
  targetId    String
  requestedAt DateTime @default(now())
  source      String
  requester   Member   @relation("Requester", fields: [requesterId], references: [id])
  target      Member   @relation("Target", fields: [targetId], references: [id])

  @@index([targetId, requestedAt])
}
```

- [ ] **Step 3: 환경 변수 예시 작성**

Create `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ochulwan"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
TELEGRAM_CHAT_ID=""
NEXT_PUBLIC_APP_NAME="오출완"
```

- [ ] **Step 4: Prisma Client singleton 작성**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 5: Prisma scripts 추가**

Modify `package.json` scripts:

```json
{
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio"
}
```

- [ ] **Step 6: 검증**

Run:

```powershell
npx prisma validate
npx prisma generate
```

Expected: Prisma schema validation과 client generation이 성공한다.

- [ ] **Step 7: 커밋**

```powershell
git add prisma .env.example src/lib/prisma.ts package.json package-lock.json
git commit -m "chore: add prisma schema"
```

---

### Task 3: 텔레그램 메시지 파서 TDD

**Files:**
- Create: `src/lib/telegram/types.ts`
- Create: `src/lib/telegram/parser.ts`
- Create: `src/lib/telegram/parser.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/lib/telegram/parser.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseTelegramText } from "./parser";

describe("parseTelegramText", () => {
  it("detects check-in message", () => {
    expect(parseTelegramText("ㅇㅊㅇ")).toEqual({ type: "checkin" });
    expect(parseTelegramText("  ㅇㅊㅇ  ")).toEqual({ type: "checkin" });
  });

  it("detects registration command", () => {
    expect(parseTelegramText("/등록")).toEqual({ type: "register" });
  });

  it("detects request command", () => {
    expect(parseTelegramText("/요청 지훈")).toEqual({
      type: "request",
      targetName: "지훈",
    });
  });

  it("ignores unknown text", () => {
    expect(parseTelegramText("출근합니다")).toEqual({ type: "unknown" });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```powershell
npm run test -- src/lib/telegram/parser.test.ts
```

Expected: `Cannot find module './parser'` 또는 `parseTelegramText` 미정의로 실패한다.

- [ ] **Step 3: 타입과 구현 작성**

Create `src/lib/telegram/types.ts`:

```ts
export type ParsedTelegramText =
  | { type: "checkin" }
  | { type: "register" }
  | { type: "request"; targetName: string }
  | { type: "unknown" };
```

Create `src/lib/telegram/parser.ts`:

```ts
import type { ParsedTelegramText } from "./types";

export function parseTelegramText(text: string | undefined): ParsedTelegramText {
  const normalized = text?.trim();

  if (!normalized) {
    return { type: "unknown" };
  }

  if (normalized === "ㅇㅊㅇ") {
    return { type: "checkin" };
  }

  if (normalized === "/등록") {
    return { type: "register" };
  }

  const requestMatch = normalized.match(/^\/요청\s+(.+)$/);
  if (requestMatch?.[1]) {
    return { type: "request", targetName: requestMatch[1].trim() };
  }

  return { type: "unknown" };
}
```

- [ ] **Step 4: 통과 확인**

Run:

```powershell
npm run test -- src/lib/telegram/parser.test.ts
```

Expected: 모든 parser 테스트가 통과한다.

- [ ] **Step 5: 커밋**

```powershell
git add src/lib/telegram
git commit -m "feat: parse telegram commands"
```

---

### Task 4: 출근 도메인 로직 TDD

**Files:**
- Create: `src/lib/date.ts`
- Create: `src/lib/titles.ts`
- Create: `src/lib/attendance.ts`
- Create: `src/lib/attendance.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/lib/attendance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createAttendanceService } from "./attendance";

describe("attendance service", () => {
  it("creates first check-in and assigns rank 1", async () => {
    const service = createAttendanceService();

    const result = await service.checkIn({
      memberId: "member-1",
      displayName: "수진",
      now: new Date("2026-07-03T08:21:00+09:00"),
    });

    expect(result.status).toBe("created");
    expect(result.record.dailyRank).toBe(1);
    expect(result.message).toContain("수진");
  });

  it("does not create duplicate same-day check-in", async () => {
    const service = createAttendanceService();
    const now = new Date("2026-07-03T08:21:00+09:00");

    await service.checkIn({ memberId: "member-1", displayName: "수진", now });
    const duplicate = await service.checkIn({
      memberId: "member-1",
      displayName: "수진",
      now: new Date("2026-07-03T09:21:00+09:00"),
    });

    expect(duplicate.status).toBe("duplicate");
    expect(service.records).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```powershell
npm run test -- src/lib/attendance.test.ts
```

Expected: `createAttendanceService` 미정의로 실패한다.

- [ ] **Step 3: 날짜 유틸 작성**

Create `src/lib/date.ts`:

```ts
export function toAttendanceDate(now: Date): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(now).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatKoreanTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
```

- [ ] **Step 4: 칭호 유틸 작성**

Create `src/lib/titles.ts`:

```ts
const TITLES = [
  "모닝 생존자",
  "출근의 지배자",
  "지각 방어 성공",
  "커피 전사",
  "오늘도 해냈다",
];

export function pickTitle(seed: string): string {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TITLES[total % TITLES.length];
}
```

- [ ] **Step 5: 메모리 기반 서비스 구현**

Create `src/lib/attendance.ts`:

```ts
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
```

- [ ] **Step 6: 통과 확인**

Run:

```powershell
npm run test -- src/lib/attendance.test.ts
```

Expected: 출근 도메인 테스트가 통과한다.

- [ ] **Step 7: 커밋**

```powershell
git add src/lib/date.ts src/lib/titles.ts src/lib/attendance.ts src/lib/attendance.test.ts
git commit -m "feat: add attendance domain logic"
```

---

### Task 5: DB 저장소 기반 멤버와 출근 로직 연결

**Files:**
- Create: `src/lib/members.ts`
- Modify: `src/lib/attendance.ts`
- Create: `src/lib/today.ts`
- Create: `src/lib/today.test.ts`

- [ ] **Step 1: 오늘 요약 실패 테스트 작성**

Create `src/lib/today.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildTodaySummary } from "./today";

describe("buildTodaySummary", () => {
  it("splits checked-in and not-yet-checked-in members", () => {
    const summary = buildTodaySummary({
      members: [
        { id: "1", displayName: "수진" },
        { id: "2", displayName: "지훈" },
      ],
      records: [
        {
          memberId: "1",
          displayName: "수진",
          checkedInAt: new Date("2026-07-03T08:21:00+09:00"),
          dailyRank: 1,
          title: "모닝 생존자",
        },
      ],
    });

    expect(summary.completed).toHaveLength(1);
    expect(summary.pending).toEqual([{ id: "2", displayName: "지훈" }]);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```powershell
npm run test -- src/lib/today.test.ts
```

Expected: `buildTodaySummary` 미정의로 실패한다.

- [ ] **Step 3: 오늘 요약 구현**

Create `src/lib/today.ts`:

```ts
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
```

- [ ] **Step 4: 멤버 저장 함수 작성**

Create `src/lib/members.ts`:

```ts
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
```

- [ ] **Step 5: 통과 확인**

Run:

```powershell
npm run test -- src/lib/today.test.ts
npx prisma validate
```

Expected: 테스트와 Prisma validation이 통과한다.

- [ ] **Step 6: 커밋**

```powershell
git add src/lib/members.ts src/lib/today.ts src/lib/today.test.ts
git commit -m "feat: summarize today's attendance"
```

---

### Task 6: 텔레그램 Webhook Route Handler

**Files:**
- Create: `src/lib/telegram/client.ts`
- Create: `src/app/api/telegram/webhook/route.ts`
- Create: `src/app/api/telegram/webhook/route.test.ts`

- [ ] **Step 1: Telegram client 작성**

Create `src/lib/telegram/client.ts`:

```ts
export type SendMessageInput = {
  chatId: string;
  text: string;
};

export async function sendTelegramMessage(input: SendMessageInput) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: input.chatId,
      text: input.text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed: ${response.status}`);
  }
}
```

- [ ] **Step 2: Route Handler 구현**

Create `src/app/api/telegram/webhook/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAttendanceService } from "@/lib/attendance";
import { upsertTelegramMember } from "@/lib/members";
import { parseTelegramText } from "@/lib/telegram/parser";
import { sendTelegramMessage } from "@/lib/telegram/client";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat: { id: number | string };
    from?: {
      id: number | string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
};

function displayNameFromUser(user: NonNullable<TelegramUpdate["message"]>["from"]) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  return name || user?.username || String(user?.id);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  const configuredChatId = process.env.TELEGRAM_CHAT_ID;

  if (!message?.from || !message.text || String(message.chat.id) !== configuredChatId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const parsed = parseTelegramText(message.text);
  if (parsed.type === "unknown") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const member = await upsertTelegramMember(prisma, {
    telegramUserId: String(message.from.id),
    telegramUsername: message.from.username,
    displayName: displayNameFromUser(message.from),
  });

  if (parsed.type === "register") {
    await sendTelegramMessage({
      chatId: configuredChatId,
      text: `${member.displayName}님 등록 완료. 이제 ㅇㅊㅇ 준비 끝.`,
    });
    return NextResponse.json({ ok: true });
  }

  if (parsed.type === "checkin") {
    const service = createAttendanceService();
    const result = await service.checkIn({
      memberId: member.id,
      displayName: member.displayName,
      now: new Date(),
    });

    await sendTelegramMessage({ chatId: configuredChatId, text: result.message });
    return NextResponse.json({ ok: true, status: result.status });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: 주의사항 기록**

이 Task의 Route Handler는 도메인 연결의 첫 형태다. 다음 Task에서 Prisma 기반 출근 저장으로 교체해야 한다. 이 상태로 커밋하지 말고 Task 7까지 이어서 수정한다.

---

### Task 7: Prisma 기반 출근 저장으로 교체

**Files:**
- Modify: `src/lib/attendance.ts`
- Modify: `src/app/api/telegram/webhook/route.ts`

- [ ] **Step 1: Prisma 기반 함수 추가**

Modify `src/lib/attendance.ts` by adding:

```ts
import type { PrismaClient } from "@prisma/client";

export async function checkInWithPrisma(
  prisma: PrismaClient,
  input: CheckInInput,
) {
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
      message: `${input.displayName}님은 이미 ${formatKoreanTime(
        existing.checkedInAt,
      )}에 오출완했습니다.`,
    };
  }

  const dailyRank =
    (await prisma.attendanceRecord.count({ where: { attendanceDate } })) + 1;
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
    message: `${input.displayName}님 오늘 ${dailyRank}번째 오출완, ${formatKoreanTime(
      input.now,
    )} 도장 완료. 오늘의 칭호: ${title}`,
  };
}
```

- [ ] **Step 2: Webhook에서 Prisma 함수 사용**

Modify `src/app/api/telegram/webhook/route.ts`:

```ts
import { checkInWithPrisma } from "@/lib/attendance";
```

Replace the check-in block:

```ts
if (parsed.type === "checkin") {
  const result = await checkInWithPrisma(prisma, {
    memberId: member.id,
    displayName: member.displayName,
    now: new Date(),
  });

  await sendTelegramMessage({ chatId: configuredChatId, text: result.message });
  return NextResponse.json({ ok: true, status: result.status });
}
```

- [ ] **Step 3: 검증**

Run:

```powershell
npm run test
npm run build
```

Expected: 테스트와 빌드가 통과한다.

- [ ] **Step 4: 커밋**

```powershell
git add src/lib/attendance.ts src/app/api/telegram/webhook/route.ts src/lib/telegram/client.ts
git commit -m "feat: handle telegram checkins"
```

---

### Task 8: 요청 기능 구현

**Files:**
- Create: `src/lib/requests.ts`
- Create: `src/lib/requests.test.ts`
- Create: `src/app/api/requests/route.ts`
- Modify: `src/app/api/telegram/webhook/route.ts`

- [ ] **Step 1: rate limit 실패 테스트 작성**

Create `src/lib/requests.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canRequestAgain } from "./requests";

describe("canRequestAgain", () => {
  it("blocks requests within 30 minutes", () => {
    const last = new Date("2026-07-03T08:00:00+09:00");
    const now = new Date("2026-07-03T08:20:00+09:00");

    expect(canRequestAgain(last, now)).toBe(false);
  });

  it("allows requests after 30 minutes", () => {
    const last = new Date("2026-07-03T08:00:00+09:00");
    const now = new Date("2026-07-03T08:31:00+09:00");

    expect(canRequestAgain(last, now)).toBe(true);
  });
});
```

- [ ] **Step 2: 요청 유틸 구현**

Create `src/lib/requests.ts`:

```ts
import type { PrismaClient } from "@prisma/client";

const REQUEST_COOLDOWN_MS = 30 * 60 * 1000;

export function canRequestAgain(lastRequestedAt: Date | null, now: Date) {
  if (!lastRequestedAt) {
    return true;
  }

  return now.getTime() - lastRequestedAt.getTime() >= REQUEST_COOLDOWN_MS;
}

export async function createCheckinRequest(input: {
  prisma: PrismaClient;
  requesterId: string;
  targetId: string;
  source: "web" | "telegram";
  now: Date;
}) {
  const lastRequest = await input.prisma.checkinRequest.findFirst({
    where: { targetId: input.targetId },
    orderBy: { requestedAt: "desc" },
  });

  if (!canRequestAgain(lastRequest?.requestedAt ?? null, input.now)) {
    return { status: "rate_limited" as const };
  }

  const request = await input.prisma.checkinRequest.create({
    data: {
      requesterId: input.requesterId,
      targetId: input.targetId,
      source: input.source,
      requestedAt: input.now,
    },
  });

  return { status: "created" as const, request };
}
```

- [ ] **Step 3: 웹 요청 API 구현**

Create `src/app/api/requests/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckinRequest } from "@/lib/requests";
import { sendTelegramMessage } from "@/lib/telegram/client";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    requesterId: string;
    targetId: string;
  };

  const [requester, target] = await Promise.all([
    prisma.member.findUnique({ where: { id: body.requesterId } }),
    prisma.member.findUnique({ where: { id: body.targetId } }),
  ]);

  if (!requester || !target) {
    return NextResponse.json({ ok: false, error: "member_not_found" }, { status: 404 });
  }

  const result = await createCheckinRequest({
    prisma,
    requesterId: requester.id,
    targetId: target.id,
    source: "web",
    now: new Date(),
  });

  if (result.status === "rate_limited") {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  await sendTelegramMessage({
    chatId: process.env.TELEGRAM_CHAT_ID ?? "",
    text: `${requester.displayName}님이 ${target.displayName}님에게 ㅇㅊㅇ을 요청했습니다.`,
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: 텔레그램 `/요청 이름` 처리 연결**

Modify `src/app/api/telegram/webhook/route.ts` imports:

```ts
import { findMemberByDisplayName } from "@/lib/members";
import { createCheckinRequest } from "@/lib/requests";
```

Add this block before the final `return NextResponse.json({ ok: true });`:

```ts
if (parsed.type === "request") {
  const target = await findMemberByDisplayName(prisma, parsed.targetName);

  if (!target) {
    await sendTelegramMessage({
      chatId: configuredChatId,
      text: `${parsed.targetName}님을 아직 찾을 수 없습니다. 먼저 ㅇㅊㅇ 또는 /등록이 필요합니다.`,
    });
    return NextResponse.json({ ok: true, status: "target_not_found" });
  }

  const requestResult = await createCheckinRequest({
    prisma,
    requesterId: member.id,
    targetId: target.id,
    source: "telegram",
    now: new Date(),
  });

  const text =
    requestResult.status === "rate_limited"
      ? `${target.displayName}님은 방금 요청받았습니다. 잠시 후 다시 찔러주세요.`
      : `${member.displayName}님이 ${target.displayName}님에게 ㅇㅊㅇ을 요청했습니다.`;

  await sendTelegramMessage({ chatId: configuredChatId, text });
  return NextResponse.json({ ok: true, status: requestResult.status });
}
```

- [ ] **Step 5: 검증**

Run:

```powershell
npm run test -- src/lib/requests.test.ts
npm run build
```

Expected: 요청 테스트와 빌드가 통과한다.

- [ ] **Step 6: 커밋**

```powershell
git add src/lib/requests.ts src/lib/requests.test.ts src/app/api/requests/route.ts src/app/api/telegram/webhook/route.ts
git commit -m "feat: add checkin request flow"
```

---

### Task 9: 오늘 상태 API와 대시보드 UI

**Files:**
- Create: `src/app/api/today/route.ts`
- Create: `src/components/AttendanceDashboard.tsx`
- Create: `src/components/RequestButton.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: 오늘 상태 API 구현**

Create `src/app/api/today/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toAttendanceDate } from "@/lib/date";
import { buildTodaySummary } from "@/lib/today";

export async function GET() {
  const attendanceDate = toAttendanceDate(new Date());
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
```

- [ ] **Step 2: 요청 버튼 컴포넌트 작성**

Create `src/components/RequestButton.tsx`:

```tsx
"use client";

import { useState } from "react";

type RequestButtonProps = {
  requesterId: string;
  targetId: string;
};

export function RequestButton({ requesterId, targetId }: RequestButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function requestCheckin() {
    setStatus("sending");
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requesterId, targetId }),
    });

    setStatus(response.ok ? "sent" : "error");
  }

  return (
    <button className="requestButton" disabled={status === "sending"} onClick={requestCheckin}>
      {status === "sent" ? "요청 완료" : "ㅇㅊㅇ 요청"}
    </button>
  );
}
```

- [ ] **Step 3: 대시보드 컴포넌트 작성**

Create `src/components/AttendanceDashboard.tsx`:

```tsx
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
```

- [ ] **Step 4: 페이지에서 DB 조회**

Modify `src/app/page.tsx`:

```tsx
import { AttendanceDashboard } from "@/components/AttendanceDashboard";
import { prisma } from "@/lib/prisma";
import { toAttendanceDate } from "@/lib/date";
import { buildTodaySummary } from "@/lib/today";

export default async function Home() {
  const attendanceDate = toAttendanceDate(new Date());
  const [members, records] = await Promise.all([
    prisma.member.findMany({ where: { isActive: true }, orderBy: { displayName: "asc" } }),
    prisma.attendanceRecord.findMany({
      where: { attendanceDate },
      include: { member: true },
      orderBy: { dailyRank: "asc" },
    }),
  ]);

  const summary = buildTodaySummary({
    members: members.map((member) => ({ id: member.id, displayName: member.displayName })),
    records: records.map((record) => ({
      memberId: record.memberId,
      displayName: record.member.displayName,
      checkedInAt: record.checkedInAt,
      dailyRank: record.dailyRank,
      title: record.title,
    })),
  });

  return <AttendanceDashboard {...summary} requesterId={summary.completed[0]?.memberId} />;
}
```

- [ ] **Step 5: 스타일 작성**

Modify `src/app/globals.css`:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f8fafc;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
}

.dashboard {
  width: min(1120px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 32px 0;
}

.hero,
.stats,
.columns {
  display: grid;
  gap: 16px;
}

.hero {
  grid-template-columns: 1fr auto;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 20px;
}

.eyebrow {
  color: #2563eb;
  font-weight: 800;
}

h1 {
  margin: 0;
  font-size: 36px;
}

h2 {
  font-size: 20px;
}

.liveBadge,
.requestButton {
  border: 0;
  border-radius: 999px;
  background: #16a34a;
  color: white;
  font-weight: 800;
  padding: 8px 12px;
}

.stats {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 20px 0;
}

.stats article,
.row,
.pendingPanel {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  padding: 14px;
}

.stats span,
.row span {
  color: #64748b;
}

.columns {
  grid-template-columns: 1.2fr 0.8fr;
}

.list {
  display: grid;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pendingPanel {
  background: #fff7ed;
  border-color: #fed7aa;
}

@media (max-width: 760px) {
  .stats,
  .columns {
    grid-template-columns: 1fr;
  }

  .row {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 6: 검증**

Run:

```powershell
npm run build
```

Expected: 대시보드 페이지가 빌드된다.

- [ ] **Step 7: 커밋**

```powershell
git add src/app src/components src/lib/today.ts
git commit -m "feat: build attendance dashboard"
```

---

### Task 10: README와 로컬 검증

**Files:**
- Create: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: README 작성**

Create `README.md`:

```md
# 오출완

텔레그램 그룹 채팅방에서 `ㅇㅊㅇ`을 입력하면 출근 완료로 기록하고, 웹 대시보드에서 오늘 출근자와 미출근자를 보여주는 Next.js 앱입니다.

## 준비

```bash
npm install
cp .env.example .env
```

`.env`에 다음 값을 설정합니다.

- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_CHAT_ID`

## DB

```bash
npm run db:migrate
npm run db:generate
```

## 개발 서버

```bash
npm run dev
```

## 테스트

```bash
npm run test
npm run build
```

## 텔레그램 Webhook

배포된 URL이 `https://example.com`이라면 Telegram Bot API의 `setWebhook`을 사용해 아래 엔드포인트로 설정합니다.

```text
https://example.com/api/telegram/webhook
```

Webhook secret은 `TELEGRAM_WEBHOOK_SECRET`과 같은 값으로 설정합니다.
```

- [ ] **Step 2: gitignore 확인**

Ensure `.gitignore` contains:

```gitignore
.env
.env.local
node_modules/
.next/
.superpowers/
```

- [ ] **Step 3: 전체 검증**

Run:

```powershell
npm run test
npm run build
```

Expected: 모든 테스트와 빌드가 통과한다.

- [ ] **Step 4: 커밋**

```powershell
git add README.md .gitignore
git commit -m "docs: add local setup guide"
```

---

## 자체 점검

- 스펙의 핵심 요구사항인 `ㅇㅊㅇ` 출근 체크는 Task 3, 4, 6, 7에서 구현한다.
- 사용자 등록형 멤버 관리는 Task 5와 Task 6에서 구현한다.
- 웹/텔레그램 요청 기능은 Task 8에서 구현한다.
- 오늘 대시보드는 Task 9에서 구현한다.
- 추후 개인 출근 패턴 확장을 위한 기록 저장은 Task 2의 `attendance_records` 스키마로 확보한다.
- 자동 전체 멤버 수집, 자동 반복 알림, 복잡한 인증은 MVP 범위에서 제외했다.
