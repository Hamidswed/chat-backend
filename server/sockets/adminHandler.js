// server/sockets/adminHandler.js
import { chatHistory } from '../utils/chatHistory.js';

let adminSocket = null;

export const handleAdminConnection = (socket, io) => {
  // اگر ادمین دیگری متصل باشد، قطع می‌شود
  if (adminSocket) {
    adminSocket.emit('admin_notification', 'Another admin connected. You are disconnected.');
    adminSocket.disconnect();
  }

  adminSocket = socket;
  console.log('✅ Admin connected:', socket.id);

  // ادمین را در یک روم مخصوص عضو کن تا رویدادها فقط برای ادمین‌ها ارسال شود
  socket.join('admins');

  // ارسال لیست چت‌های اخیر
  const recentChats = Object.entries(chatHistory)
    .map(([room, history]) => {
      const lastMsg = history[history.length - 1];
      return {
        sessionId: room, // مثلاً chat-abc123
        name: lastMsg?.name || 'Unknown',
        email: lastMsg?.email || 'Unknown',
        lastMessage: lastMsg?.text,
        timestamp: lastMsg?.timestamp
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  socket.emit('admin_recent_chats', recentChats);

  // ارسال تاریخچه یک گفتگو به درخواست ادمین
  socket.on('admin_get_thread', ({ sessionId }) => {
    const history = chatHistory[sessionId] || [];
    socket.emit('admin_thread_history', { sessionId, history });
  });

  // دریافت پاسخ ادمین و ارسال به کاربر
  socket.on('admin_reply', ({ sessionId, text }) => {
    const room = sessionId; // چون sessionId از قبل chat- دارد
    const replyMsg = {
      from: 'admin',
      text,
      timestamp: new Date().toISOString()
    };

    // ارسال به اتاق کاربر
    io.to(room).emit('new_message', replyMsg);

    // ذخیره در تاریخچه
    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(replyMsg);

    // اطلاع‌رسانی به لیست چت‌های ادمین (فقط روم ادمین‌ها)
    io.to('admins').emit('admin_chats_update', {
      sessionId: room,
      lastMessage: replyMsg.text,
      timestamp: replyMsg.timestamp
    });

    console.log(`📩 Admin replied to session: ${sessionId}`);
  });

  // قطع اتصال ادمین
  socket.on('disconnect', () => {
    if (socket.id === adminSocket?.id) {
      adminSocket = null;
      console.log('🔴 Admin disconnected');
    }
  });
};

// برای استفاده در userHandler
export const getAdminSocket = () => adminSocket;