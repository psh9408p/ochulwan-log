# 오출완

텔레그램 그룹 채팅방에서 `ㅇㅊㅇ`을 입력하면 출근 완료로 기록하고, 웹 대시보드에서 오늘 출근자와 미출근자를 보여주는 Next.js 앱입니다.

## 주요 기능

- 텔레그램 그룹에서 `ㅇㅊㅇ` 메시지로 오늘 출근 체크
- 첫 `ㅇㅊㅇ` 또는 `/등록` 사용자를 자동 멤버 등록
- 오늘 출근 완료자와 아직 안 찍은 사람 목록 표시
- 웹 버튼 또는 `/요청 이름` 명령으로 `ㅇㅊㅇ` 요청
- 출근 기록 누적을 통한 추후 개인 출근 패턴 확장 기반

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