import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID

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

let chatHistory = [];

io.on('connection', (socket) => {
  console.log('The user is connected:', socket.id);
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
      console.log('✅ The message was sent to Telegram.');
    } catch (error) {
      console.error('❌ Error while sending message:', error.response?.data || error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('The user disconnedted.', socket.id);
  });
});

// تنظیم webhook تلگرام
const WEBHOOK_URL = 'https://chat-backend-3xpu.onrender.com/telegram-webhook';

// تنظیم webhook در تلگرام
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

app.post('/telegram-webhook', (req, res) => {
  const message = req.body.message;
  if (message && message.text && message.reply_to_message) {
    const replyMsg = { from: 'admin', text: message.text };
    chatHistory.push(replyMsg);
    io.emit('new_message', replyMsg);
    console.log('📩 The message of Admin is sent.');
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ The server is runnig on port ${PORT}`);
});