import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8355451761:AAFFWcnLkpgnbcx3nWnc9_m8bsqvlRAGCT8';
const TELEGRAM_USER_ID = '154972852';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://hdelshad.com",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

let chatHistory = [];

io.on('connection', (socket) => {
  console.log('کاربر متصل شد:', socket.id);
  socket.emit('chat_history', chatHistory);

  socket.on('user_message', async (msg) => {
    const userMsg = { from: 'user', text: msg };
    chatHistory.push(userMsg);
    io.emit('new_message', userMsg);

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_USER_ID,
        text: msg,
      });
      console.log('✅ پیام به تلگرام فرستاده شد');
    } catch (error) {
      console.error('❌ خطا در ارسال به تلگرام:', error.response?.data || error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('کاربر قطع ارتباط داد:', socket.id);
  });
});

app.post('/telegram-webhook', (req, res) => {
  const message = req.body.message;
  if (message && message.text && message.reply_to_message) {
    const replyMsg = { from: 'admin', text: message.text };
    chatHistory.push(replyMsg);
    io.emit('new_message', replyMsg);
    console.log('📩 پیام ادمین به چت ارسال شد');
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ سرور در حال اجرا روی پورت ${PORT}`);
});