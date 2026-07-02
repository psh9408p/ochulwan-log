# Telegram Attendance Design

## Summary

Build "오출완", a playful attendance dashboard connected to a Telegram group chat. People check in by typing `ㅇㅊㅇ` in the active Telegram chat. The site shows who has completed today's check-in, who has not, the user's own stamp, and lightweight social nudges to ask others to check in.

The recommended architecture is a Next.js full-stack app with a database and Telegram webhook endpoint.

Use PostgreSQL for the database so the same schema works for local development and production deployment. Prisma is the preferred ORM unless implementation constraints make another typed query layer a better fit.

## Goals

- Let Telegram group members check in by sending `ㅇㅊㅇ`.
- Automatically register users the first time they check in or use a registration command.
- Show today's checked-in and not-yet-checked-in members on a web dashboard.
- Show each check-in time, daily order, and a short random title or message.
- Let checked-in users request not-yet-checked-in members to type `ㅇㅊㅇ`.
- Support both web button requests and Telegram command requests.
- Keep the data model ready for later personal attendance pattern pages.

## Non-Goals For MVP

- Automatically scraping every Telegram group member.
- Fully automated daily reminder spam.
- Complex login or organization management.
- Multi-group support beyond a single configured Telegram chat.
- Advanced analytics beyond storing enough history for future use.

## Product Direction

The selected visual direction is "응원 게시판형".

The dashboard should feel like a friendly team board:

- Prominent "오늘출근완료" status.
- Count of today's completed check-ins.
- List of completed members with check-in time and fun title.
- List of not-yet-completed members with `ㅇㅊㅇ 요청` buttons.
- A visible "my stamp" area for the current user.
- A small hint that Telegram command `/요청 이름` is also available.

## Telegram Behavior

### Check-In

When a user sends `ㅇㅊㅇ` in the configured Telegram group:

1. The webhook receives the Telegram update.
2. The app verifies the update is from the configured chat.
3. The Telegram user is created or updated in the local member table.
4. The app creates today's attendance record if one does not already exist.
5. The bot replies in the group with a short message containing:
   - Display name.
   - Today's order.
   - Check-in time.
   - A random short title or comment.

If the user already checked in today, the bot replies with an "already completed" style message and does not create a duplicate record.

### Request Another User

The app supports two request paths:

- Web: click `ㅇㅊㅇ 요청` beside a not-yet-completed member.
- Telegram: send `/요청 이름`.

The bot sends a playful mention-style message in the Telegram group asking that person to check in. The request should be rate-limited per target member to prevent repeated spam.

### Registration

Telegram does not provide a general reliable way for a bot to fetch all group members. The MVP uses user registration:

- A member is registered when they first send `ㅇㅊㅇ`.
- A member can also register through a command such as `/등록`.
- Only registered members appear in the not-yet-completed list.

This avoids depending on Telegram capabilities that are limited or administrator-dependent.

## Web Dashboard

### Main View

The dashboard shows the current local date's attendance state:

- Date and live status.
- Total completed count.
- First check-in of the day.
- Current user's check-in status.
- Remaining count.
- Completed list sorted by check-in time.
- Not-yet-completed list sorted by a stable member order or recent activity.

For the MVP, the dashboard is a shared board for the configured Telegram chat. The "my stamp" area can be driven by a simple registered-member selector stored in the browser. A later version can replace this with Telegram Login or another authenticated identity flow.

Each completed item shows:

- Rank.
- Display name.
- Check-in time.
- Random title/comment.

Each not-yet-completed item shows:

- Display name.
- Helpful secondary text, such as last check-in time or average check-in time when available.
- `ㅇㅊㅇ 요청` action.

### Future Personal Pattern View

The data model should preserve check-in history so a future personal page can show:

- Average check-in time.
- Earliest and latest check-in.
- Day-of-week pattern.
- Recent streak.
- Calendar or timeline of check-ins.

This is not part of the first MVP screen, but the schema must not block it.

## Architecture

Use a single Next.js app:

- App Router pages for the dashboard and future profile views.
- Route handlers for Telegram webhook and dashboard actions.
- Server-side database access for attendance state.
- PostgreSQL for durable attendance history.
- Client components only where interactivity is needed, such as request buttons and live refresh.

Suggested API routes:

- `POST /api/telegram/webhook`: receive Telegram updates.
- `POST /api/requests`: send a check-in request from the web dashboard.
- `GET /api/today`: fetch today's attendance state if the dashboard uses client refresh.

Suggested server modules:

- `telegram`: parse updates and send bot messages.
- `attendance`: check-in creation, duplicate handling, daily summaries.
- `members`: registration and display-name matching.
- `requests`: request validation and rate limiting.
- `titles`: random title/comment selection.

## Data Model

Core tables:

- `members`
  - `id`
  - `telegram_user_id`
  - `telegram_username`
  - `display_name`
  - `first_seen_at`
  - `last_seen_at`
  - `is_active`

- `attendance_records`
  - `id`
  - `member_id`
  - `attendance_date`
  - `checked_in_at`
  - `daily_rank`
  - `title`
  - unique key on `member_id + attendance_date`

- `checkin_requests`
  - `id`
  - `requester_member_id`
  - `target_member_id`
  - `requested_at`
  - `source` (`web` or `telegram`)

The `attendance_records` table is the basis for future personal pattern analytics.

## Error Handling

- Ignore webhook updates from unknown chats.
- Ignore messages that are not recognized commands or `ㅇㅊㅇ`.
- Return a friendly duplicate response for repeated same-day check-ins.
- If `/요청 이름` does not match a registered member, reply with a short "not found" message.
- If the same person is requested too frequently, reply that they were already nudged recently.
- If Telegram send fails, log the error and return a non-secret generic error to the web action.

## Security And Configuration

Environment variables:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_CHAT_ID`
- `DATABASE_URL`

Webhook requests should verify a secret token or configured webhook secret header. Bot tokens must never be committed.

## Testing Strategy

Unit tests:

- `ㅇㅊㅇ` message detection.
- Duplicate check-in behavior.
- Daily rank assignment.
- `/요청 이름` parsing and member matching.
- Request rate limiting.

Integration tests:

- Telegram webhook creates a member and attendance record.
- Web request creates a request record and sends a Telegram message through a mocked client.
- Dashboard summary returns completed and not-yet-completed members.

Manual verification:

- Simulate Telegram webhook payloads locally.
- Confirm dashboard updates after check-in.
- Confirm request button triggers a Telegram message in a test chat.

## Implementation Order

1. Scaffold Next.js app.
2. Add database schema and local development database.
3. Implement attendance and member domain logic with tests.
4. Implement Telegram webhook route.
5. Implement dashboard UI from the approved mockup.
6. Implement web and Telegram request flows.
7. Add setup documentation for Telegram bot token, chat ID, and webhook.
