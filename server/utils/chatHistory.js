// server/utils/chatHistory.js
export const chatHistory = {};

export const getChatHistory = (room) => {
  if (!chatHistory[room]) {
    return [];
  }
  return chatHistory[room];
};

export const addMessageToChat = (room, message) => {
  if (!chatHistory[room]) {
    chatHistory[room] = [];
  }
  
  // اضافه کردن پیام به تاریخچه
  chatHistory[room].push(message);
  
  // نگه داشتن فقط 100 پیام آخر برای هر اتاق
  if (chatHistory[room].length > 100) {
    chatHistory[room] = chatHistory[room].slice(-100);
  }
  
  console.log(`💾 Message added to chat history for room ${room}. Total messages: ${chatHistory[room].length}`);
};

export const getRecentChats = () => {
  return Object.entries(chatHistory)
    .map(([room, history]) => {
      if (history && history.length > 0) {
        const lastMsg = history[history.length - 1];
        const firstMsg = history[0];
        return {
          sessionId: room,
          name: firstMsg?.name || lastMsg?.name || 'Unknown',
          email: firstMsg?.email || lastMsg?.email || 'Unknown',
          lastMessage: lastMsg?.text || 'No message',
          timestamp: lastMsg?.timestamp || new Date().toISOString(),
          messageCount: history.length
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const getChatStats = () => {
  const totalRooms = Object.keys(chatHistory).length;
  const totalMessages = Object.values(chatHistory).reduce((sum, history) => sum + history.length, 0);
  
  return {
    totalRooms,
    totalMessages,
    roomsWithMessages: Object.entries(chatHistory).filter(([_, history]) => history.length > 0).length
  };
};