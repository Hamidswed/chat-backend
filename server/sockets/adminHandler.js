// server/sockets/adminHandler.js
import { getRecentChats, getChatStats } from '../utils/chatHistory.js';

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

  // دریافت آمار چت‌ها
  const chatStats = getChatStats();
  console.log(`📊 Chat stats: ${chatStats.totalRooms} rooms, ${chatStats.totalMessages} messages`);

  // ارسال لیست چت‌های اخیر - همه چت‌های موجود
  const recentChats = getRecentChats();
  console.log(`📋 Sending ${recentChats.length} existing chats to admin`);
  socket.emit('admin_recent_chats', recentChats);

  // ارسال تاریخچه یک گفتگو به درخواست ادمین
  socket.on('admin_get_thread', async ({ sessionId }) => {
    const { getChatHistory } = await import('../utils/chatHistory.js');
    const history = getChatHistory(sessionId) || [];
    console.log(`📖 Admin requested thread history for ${sessionId}, found ${history.length} messages`);
    socket.emit('admin_thread_history', { sessionId, history });
  });

  // دریافت پاسخ ادمین و ارسال به کاربر
  socket.on('admin_reply', async ({ sessionId, text }) => {
    const room = sessionId; // چون sessionId از قبل chat- دارد
    const replyMsg = {
      from: 'admin',
      text,
      timestamp: new Date().toISOString()
    };

    // ارسال به اتاق کاربر
    io.to(room).emit('new_message', replyMsg);

    // ذخیره در تاریخچه
    const { addMessageToChat } = await import('../utils/chatHistory.js');
    addMessageToChat(room, replyMsg);

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