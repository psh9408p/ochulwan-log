import { PrismaClient } from "@prisma/client";
import { sendDueLeaveReminders } from "../src/lib/leaveReminders.ts";

const intervalMs = Number(process.env.LEAVE_REMINDER_INTERVAL_MS ?? 60_000);
const chatId = process.env.TELEGRAM_CHAT_ID;
const prisma = new PrismaClient();

if (!chatId) {
  console.error("TELEGRAM_CHAT_ID is required");
  process.exit(1);
}

async function tick() {
  const result = await sendDueLeaveReminders({
    prisma,
    chatId,
    now: new Date(),
  });

  if (result.sentCount > 0) {
    console.log(`[leave-reminder] sent ${result.sentCount} reminder(s)`);
  }
}

console.log(`[leave-reminder] worker started, interval=${intervalMs}ms`);
await tick();

if (process.env.LEAVE_REMINDER_RUN_ONCE === "true" || process.argv.includes("--once")) {
  await prisma.$disconnect();
  process.exit(0);
}

const timer = setInterval(() => {
  tick().catch((error) => {
    console.error("[leave-reminder] tick failed", error);
  });
}, intervalMs);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    clearInterval(timer);
    await prisma.$disconnect();
    process.exit(0);
  });
}
