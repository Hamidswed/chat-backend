// server/utils/chatHistory.js
export const chatHistory = {};

export const getChatHistory = (room) => chatHistory[room] || [];

export const addMessageToChat = (room, message) => {
  if (!chatHistory[room]) chatHistory[room] = [];
  chatHistory[room].push(message);
};