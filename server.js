import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import post from 'axios';
import pkg from 'body-parser';

const TELEGRAM_BOT_TOKEN = '8355451761:AAFFWcnLkpgnbcx3nWnc9_m8bsqvlRAGCT8'; // <-- Replace with your bot token
const TELEGRAM_USER_ID = '154972852'; // <-- Replace with your Telegram user ID

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const { json } = pkg;

app.use(json());

let chatHistory = [];

io.on('connection', (socket) => {
  socket.emit('chat_history', chatHistory);

  socket.on('user_message', async (msg) => {
    const userMsg = { from: 'user', text: msg };
    chatHistory.push(userMsg);
    io.emit('new_message', userMsg);

    // Send to Telegram
    await post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_USER_ID,
      text: msg,
    });
  });
});

// Telegram webhook endpoint
app.post('/telegram-webhook', (req, res) => {
  const message = req.body.message;
  if (message && message.text && message.reply_to_message) {
    const replyMsg = { from: 'admin', text: message.text };
    chatHistory.push(replyMsg);
    io.emit('new_message', replyMsg);
  }
  res.sendStatus(200);
});

server.listen(4000, () => {
  console.log('Server running on port 4000');
});