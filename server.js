/* eslint-disable no-undef */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // 🔐 امنیت ادمین

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_USER_ID) {
  console.error('❌ BOT_TOKEN or TELEGRAM_USER_ID not set in .env');
  process.exit(1);
}

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

app.use('/admin', express.static('admin'));

// ذخیره تاریخچه چت بر اساس اتاق
const chatHistory = {};

// ذخیره اتصال ادمین
let adminSocket = null;

app.get('/api', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// متصل شدن کاربر و ادمین
io.on('connection', (socket) => {
  const { isAdmin, password } = socket.handshake.auth;

  // ✅ احراز هویت ادمین
  if (isAdmin) {
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      socket.disconnect(true);
      return;
    }

    if (adminSocket) {
      adminSocket.emit('admin_notification', 'Another admin connected. You are disconnected.');
      adminSocket.disconnect();
    }

    adminSocket = socket;
    console.log('✅ Admin connected:', socket.id);

    // ارسال لیست چت‌های اخیر
    const recentChats = Object.entries(chatHistory).map(([room, history]) => {
      const lastMsg = history[history.length - 1];
      return {
        sessionId: room.replace('chat-', ''),
        name: lastMsg?.name || 'Unknown',
        email: lastMsg?.email || 'Unknown',
        lastMessage: lastMsg?.text,
        timestamp: lastMsg?.timestamp
      };
    }).filter(Boolean).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    socket.emit('admin_recent_chats', recentChats);

    socket.on('admin_reply', async ({ sessionId, text }) => {
      const room = `chat-${sessionId}`;
      const replyMsg = { from: 'admin', text, timestamp: new Date().toISOString() };

      // ارسال به کاربر
      io.to(room).emit('new_message', replyMsg);

      // ذخیره در تاریخچه
      if (!chatHistory[room]) chatHistory[room] = [];
      chatHistory[room].push(replyMsg);

      console.log(`📩 Admin replied to session: ${sessionId}`);
    });

    socket.on('disconnect', () => {
      if (socket.id === adminSocket?.id) {
        adminSocket = null;
        console.log('🔴 Admin disconnected');
      }
    });

    return;
  }

  // 🧑‍💻 منطق کاربر عادی
  const sessionId = socket.handshake.auth.sessionId;
  if (!sessionId) {
    socket.disconnect();
    return;
  }

  const room = `chat-${sessionId}`;
  socket.join(room);
  console.log(`User connected to room: ${room}`);

  // ارسال تاریخچه شخصی
  const userHistory = chatHistory[room] || [];
  socket.emit('chat_history', userHistory);

  // دریافت پیام کاربر
  socket.on('user_message', async (data) => {
    const { name, email, text } = data;
    const userMsg = { from: 'user', text, name, email, timestamp: new Date().toISOString() };

    // ذخیره در تاریخچه
    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(userMsg);

    // ارسال به کاربر
    io.to(room).emit('new_message', userMsg);

    // ✅ ارسال به ادمین فقط اگر متصل باشه
    if (adminSocket) {
      adminSocket.emit('admin_new_message', {
        sessionId,
        name,
        email,
        text,
        timestamp: userMsg.timestamp
      });
    }

    // ✅ ارسال به تلگرام (بدون اسپیس اضافه)
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
    console.log('✅ Webhook set successfully:', response.data);
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.response?.data || error.message);
  }
}

setWebhook();

// دریافت پاسخ ادمین از تلگرام (اختیاری - اگر بخوای از تلگرام هم پاسخ بدی)
// دریافت پاسخ ادمین از تلگرام
app.post('/telegram-webhook', (req, res) => {
  const message = req.body.message;
  if (message && message.text && message.reply_to_message) {
    const replyText = message.text.trim();
    const originalText = message.reply_to_message.text;

    // 🔍 استخراج Session ID از پیام اصلی
    const sessionIdMatch = originalText.match(/Session ID: ([^\n]+)/);
    if (!sessionIdMatch) {
      console.log('❌ Session ID not found in original message');
      return res.sendStatus(200);
    }

    const expectedSessionId = sessionIdMatch[1]; // مثلاً: sess-123456789
    const room = `chat-${expectedSessionId}`;

    // 🔍 چک کردن فرمت ریپلای: [chat-sess-...] متن پاسخ
    const replyMatch = replyText.match(/^\[chat-([^\]]+)\](.*)/);
    if (!replyMatch) {
      console.log('❌ Reply must start with [chat-...] to be processed');
      return res.sendStatus(200);
    }

    const extractedSessionId = replyMatch[1]; // باید برابر با expectedSessionId باشه

    // ✅ تطابق Session ID
    if (extractedSessionId !== expectedSessionId) {
      console.log(`❌ Mismatch: expected ${expectedSessionId}, got ${extractedSessionId}`);
      return res.sendStatus(200);
    }

    const actualReply = replyMatch[2].trim(); // متن واقعی پاسخ

    // ✅ ارسال پاسخ به چت باکس کاربر
    io.to(room).emit('new_message', {
      from: 'admin',
      text: actualReply,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Admin reply sent to room: ${room}`);
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});