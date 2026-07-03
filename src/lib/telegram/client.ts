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