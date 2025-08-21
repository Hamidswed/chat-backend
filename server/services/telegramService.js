/* eslint-disable no-undef */
// server/services/telegramService.js
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export const sendToTelegram = async (name, email, sessionId, text) => {
  const telegramMessage = `نام: ${name}\nایمیل: ${email}\nSession ID: ${sessionId}\nپیام: ${text}`;
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: TELEGRAM_USER_ID,
      text: telegramMessage
    });
    console.log('✅ Message sent to Telegram');
  } catch (error) {
    console.error('❌ Error sending to Telegram:', error.message);
  }
};

export const setupTelegramWebhook = async (app) => {
  const WEBHOOK_URL = `${process.env.HOST}/telegram-webhook`;

  try {
    await axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL });
    console.log('✅ Webhook set successfully');
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
  }

  app.post('/telegram-webhook', (req, res) => {
    const message = req.body.message;
    if (message && message.text && message.reply_to_message) {
      const replyText = message.text.trim();
      const originalText = message.reply_to_message.text;

      const sessionIdMatch = originalText.match(/Session ID: (chat-[^\n]+)/);
      if (!sessionIdMatch) return res.sendStatus(200);

      const expectedSessionId = sessionIdMatch[1];
      const replyMatch = replyText.match(/^\[([^\]]+)\](.*)/);
      if (!replyMatch) return res.sendStatus(200);

      const extractedId = replyMatch[1];
      if (extractedId !== expectedSessionId) return res.sendStatus(200);

      const actualReply = replyMatch[2].trim();
      req.io.to(expectedSessionId).emit('new_message', {
        from: 'admin',
        text: actualReply
      });

      console.log(`✅ Reply from Telegram sent to ${expectedSessionId}`);
    }
    res.sendStatus(200);
  });
};