// server/sockets/userHandler.js
import { getChatHistory, addMessageToChat } from '../utils/chatHistory.js';
import { sendToTelegram } from '../services/telegramService.js';

export const handleUserConnection = (socket) => {
  const { sessionId } = socket.handshake.auth;
  if (!sessionId) {
    socket.disconnect();
    return;
  }

  socket.join(sessionId);
  console.log(`User connected to room: ${sessionId}`);

  socket.emit('chat_history', getChatHistory(sessionId));

  socket.on('user_message', async (data) => {
    console.log('📩 SERVER received user_message:', data);
    const { name, email, text } = data;
    const userMsg = { from: 'user', text, name, email, timestamp: new Date().toISOString() };

    addMessageToChat(sessionId, userMsg);
    socket.to(sessionId).emit('new_message', userMsg);

    // ارسال به تلگرام
    await sendToTelegram(name, email, sessionId, text);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from room:', sessionId);
  });
};