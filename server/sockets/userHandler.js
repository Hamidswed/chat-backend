// server/sockets/userHandler.js
import { getChatHistory, addMessageToChat } from '../utils/chatHistory.js';
import { sendToTelegram } from '../services/telegramService.js';

export const handleUserConnection = (socket, io) => {
  const { sessionId } = socket.handshake.auth;
  if (!sessionId) {
    console.log('❌ No sessionId provided');
    socket.disconnect();
    return;
  }

  // عضویت در اتاق کاربر
  socket.join(sessionId);
  console.log(`✅ User connected to room: ${sessionId}`);

  // ارسال تاریخچه چت به کاربر
  const userHistory = getChatHistory(sessionId);
  socket.emit('chat_history', userHistory);

  // درخواست تاریخچه چت
  socket.on('request_chat_history', (roomId) => {
    console.log(`📋 User requested chat history for room: ${roomId}`);
    const history = getChatHistory(roomId);
    socket.emit('chat_history', history);
  });

  // دریافت پیام کاربر
  socket.on('user_message', async (data) => {
    const { name, email, text, clientId } = data;
    const userMsg = {
      from: 'user',
      text,
      name,
      email,
      timestamp: new Date().toISOString(),
      clientId
    };

    console.log(`📨 User message received in ${sessionId}:`, { name, email, text });

    // ذخیره در تاریخچه
    addMessageToChat(sessionId, userMsg);

    // ✅ ارسال به تمام اعضای اتاق (شامل خود کاربر) — فقط یک بار
    io.to(sessionId).emit('new_message', userMsg);

    // ارسال به تلگرام
    await sendToTelegram(name, email, sessionId, text);

    // ارسال اعلان به ادمین‌ها (فقط روم ادمین‌ها)
    io.to('admins').emit('admin_new_message', {
      sessionId,
      name,
      email,
      text,
      timestamp: userMsg.timestamp
    });

    console.log(`📤 Message sent to admin room for session: ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from room:', sessionId);
  });
};