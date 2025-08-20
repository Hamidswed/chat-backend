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
// server.js (بخش اصلاح‌شده)

// ذخیره چت‌ها بر اساس اتاق
const chatHistory = {};

// متصل شدن ادمین
io.on('connection', (socket) => {
  const isAdmin = socket.handshake.auth.isAdmin;

  if (isAdmin) {
    console.log('ادمین متصل شد:', socket.id);

    // ارسال تاریخچه به ادمین (اختیاری)
    socket.emit('admin_current_chats', Object.values(chatHistory).flat());

    // دریافت درخواست تاریخچه
    socket.on('admin_request_history', (sessionId) => {
      const room = `chat-${sessionId}`;
      socket.emit('admin_chat_history', { sessionId, history: chatHistory[room] || [] });
    });

    // ارسال پاسخ ادمین
    socket.on('admin_reply', async ({ sessionId, text }) => {
      const room = `chat-${sessionId}`;
      const replyMsg = { from: 'admin', text, timestamp: new Date().toISOString() };

      // ارسال به کاربر
      io.to(room).emit('new_message', replyMsg);

      // ذخیره در تاریخچه
      if (!chatHistory[room]) chatHistory[room] = [];
      chatHistory[room].push(replyMsg);

      console.log('📩 ادمین به کاربر پاسخ داد:', sessionId);
    });

    return;
  }

  // منطق کاربر عادی
  const sessionId = socket.handshake.auth.sessionId;
  const room = `chat-${sessionId}`;
  socket.join(room);

  const userHistory = chatHistory[room] || [];
  socket.emit('chat_history', userHistory);

  socket.on('user_message', async (data) => {
    const { name, email, text } = data;
    const userMsg = { from: 'user', text, timestamp: new Date().toISOString() };

    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(userMsg);
    io.to(room).emit('new_message', userMsg);

    // ارسال به ادمین
    io.emit('admin_new_message', { sessionId, name, email, text, timestamp: userMsg.timestamp });

    // ارسال به تلگرام
    try {
      const telegramMessage = `نام: ${name}\nایمیل: ${email}\nSession ID: ${sessionId}\nپیام: ${text}`;
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_USER_ID,
        text: telegramMessage
      });
    } catch (error) {
      console.error('Error sending to Telegram:', error.message);
    }
  });
});