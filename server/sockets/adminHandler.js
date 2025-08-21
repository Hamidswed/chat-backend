// server/sockets/adminHandler.js
import { chatHistory } from '../utils/chatHistory.js';

export const handleAdminConnection = (socket) => {
  console.log('✅ Admin connected:', socket.id);

  const recentChats = Object.entries(chatHistory)
    .map(([room, history]) => {
      const lastMsg = history[history.length - 1];
      return {
        sessionId: room.replace('chat-', ''),
        name: lastMsg?.name || 'Unknown',
        email: lastMsg?.email || 'Unknown',
        lastMessage: lastMsg?.text,
        timestamp: lastMsg?.timestamp
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  socket.emit('admin_recent_chats', recentChats);

  socket.on('admin_reply', ({ sessionId, text }) => {
    const room = `chat-${sessionId}`;
    const replyMsg = { from: 'admin', text, timestamp: new Date().toISOString() };
    socket.to(room).emit('new_message', replyMsg);
    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(replyMsg);
    console.log(`📩 Admin replied to session: ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Admin disconnected');
  });
};