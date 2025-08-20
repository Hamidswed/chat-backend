/* eslint-disable no-undef */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://hdelshad.com",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// ذخیره تاریخچه چت بر اساس اتاق
const chatHistory = {};

io.on('connection', (socket) => {
  const sessionId = socket.handshake.auth.sessionId;
  const room = `chat-${sessionId}`;

  // پیوستن به اتاق اختصاصی
  socket.join(room);
  console.log('User connected to room:', room);

  // ارسال تاریخچه اختصاصی
  const userHistory = chatHistory[room] || [];
  socket.emit('chat_history', userHistory);

  // دریافت پیام کاربر
  socket.on('user_message', async (data) => {
    const { name, email, text } = data;
    const sessionId = socket.handshake.auth.sessionId;
    const room = `chat-${sessionId}`;

    // ایجاد پیام برای چت
    const userMsg = { from: 'user', text };

    // ذخیره در تاریخچه اتاق
    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(userMsg);

    // ارسال فقط به این اتاق
    io.to(room).emit('new_message', userMsg);

    // ارسال به تلگرام
    try {
      const telegramMessage = `نام: ${name}\nایمیل: ${email}\nSession ID: ${sessionId}\nپیام: ${text}`;
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_USER_ID,
        text: telegramMessage
      });
      console.log('✅ Message sent to Telegram from:', name);
    } catch (error) {
      console.error('❌ Error sending to Telegram:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from room:', room);
  });
});

// تنظیم webhook تلگرام
const WEBHOOK_URL = 'https://chat-backend-3xpu.onrender.com/telegram-webhook';

async function setWebhook() {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      url: WEBHOOK_URL
    });
    console.log('Webhook set successfully:', response.data);
  } catch (error) {
    console.error('Failed to set webhook:', error.response?.data || error.message);
  }
}

setWebhook();

// دریافت پاسخ ادمین از تلگرام
app.post('/telegram-webhook', (req, res) => {
  const message = req.body.message;
  if (message && message.text && message.reply_to_message) {

     const fullText = message.text;

     const sessionMatch = fullText.match(/\[(chat-[^\]]+)\]/);
     if (!sessionMatch) {
      console.log('No session ID found in admin reply');
      return res.sendStatus(200);
    }

    const sessionId = sessionMatch[1];
    const room = `chat-${sessionId}`;
    const replyText = fullText.replace(/\[chat-[^\]]+\]\s*/, '');

    const replyMsg = { from: 'admin', text: message.text };
   
    io.to(room).emit('new_message', replyMsg);
    console.log('📩 Admin replied:', message.text);
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});