/* eslint-disable no-undef */
// server/services/telegramService.js
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;

// ✅ حذف فاصله اضافه در URL
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export const sendToTelegram = async (name, email, sessionId, text) => {
  const telegramMessage = `نام: ${name}\nایمیل: ${email}\nSession ID: ${sessionId}\nپیام: ${text}`;
  try {
    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: TELEGRAM_USER_ID,
      text: telegramMessage
    });
    console.log('✅ Message sent to Telegram:', response.data.message_id);
  } catch (error) {
    console.error(
      '❌ Error sending to Telegram:',
      error.response?.data || error.message
    );
  }
};

/**
 * تنظیم وبهوک تلگرام و دریافت پاسخ ادمین از طریق ریپلای
 * @param {Object} app - اپلیکیشن Express
 * @param {Object} io - سرور Socket.IO
 */
export const setupTelegramWebhook = (app, io) => {
  const HOST = process.env.HOST;

  // ✅ چک کردن HOST — فقط در محیط عمومی (مثل Render) اجرا شود
  if (!HOST) {
    console.log('⚠️ HOST not set. Skipping Telegram webhook setup (development mode)');
    return;
  }

  const WEBHOOK_URL = `${HOST}/telegram-webhook`;

  // ✅ تنظیم وبهوک تلگرام
  axios.post(`${TELEGRAM_API}/setWebhook`, { url: WEBHOOK_URL })
    .then((res) => {
      if (res.data.ok) {
        console.log('✅ Telegram webhook set successfully:', WEBHOOK_URL);
      } else {
        console.error('❌ Failed to set webhook:', res.data);
      }
    })
    .catch((error) => {
      console.error('❌ Network error setting webhook:', error.message);
    });

  // ✅ دریافت پاسخ ادمین از تلگرام (ریپلای)
  app.post('/telegram-webhook', (req, res) => {
    try {
      const message = req.body.message;
      if (message && message.text && message.reply_to_message) {
        const replyText = message.text.trim();
        const originalText = message.reply_to_message.text;

        // ✅ استخراج Session ID از پیام اصلی
        const sessionIdMatch = originalText.match(/Session ID: (chat-[^\n]+)/);
        if (!sessionIdMatch) {
          console.log('❌ Session ID not found in original message');
          return res.sendStatus(200);
        }

        const expectedSessionId = sessionIdMatch[1]; // مثلاً: chat-abc123

        // ✅ چک کردن فرمت ریپلای: [chat-abc123] پاسخ
        const replyMatch = replyText.match(/^\[([^\]]+)\](.*)/);
        if (!replyMatch) {
          console.log('❌ Reply must start with [chat-...]');
          return res.sendStatus(200);
        }

        const extractedId = replyMatch[1];
        if (extractedId !== expectedSessionId) {
          console.log(`❌ Mismatch: expected ${expectedSessionId}, got ${extractedId}`);
          return res.sendStatus(200);
        }

        const actualReply = replyMatch[2].trim();

        // ✅ ارسال پاسخ به چت باکس کاربر
        if (io && io.to(expectedSessionId)) {
          io.to(expectedSessionId).emit('new_message', {
            from: 'admin',
            text: actualReply,
            timestamp: new Date().toISOString()
          });
          console.log(`✅ Admin reply sent to room: ${expectedSessionId}`);
        } else {
          console.warn(`⚠️ Room ${expectedSessionId} not found or io not available`);
        }
      }
      res.sendStatus(200);
    } catch (err) {
      console.error('❌ Error in webhook handler:', err.message);
      res.sendStatus(500);
    }
  });
};