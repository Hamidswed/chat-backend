// server/index.js
import app from './app.js';
import { createServer } from 'http';
import setupSocket from './config/socket.js';

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 4000;
const server = createServer(app);

setupSocket(server,app);

server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🤖 AI Assistant: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled (no API key)'}`);
  console.log(`📱 Features: Chat, AI Assistant, Telegram Integration`);
});