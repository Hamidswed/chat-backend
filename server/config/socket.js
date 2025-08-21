// server/config/socket.js
import { Server } from 'socket.io';
import { authenticateAdmin } from '../sockets/authMiddleware.js';
import { handleAdminConnection } from '../sockets/adminHandler.js';
import { handleUserConnection } from '../sockets/userHandler.js';
import { setupTelegramWebhook } from '../services/telegramService.js';

export default function setupSocket(server,app) {
  const io = new Server(server, {
    cors: {
      origin: ["https://hdelshad.com", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // دسترسی به io در سرویس‌ها
   globalThis.io = io;

  // تنظیم Webhook تلگرام
  setupTelegramWebhook(app, io);//io.httpServer

  // اتصال کاربران
  // io.use(authenticateAdmin).on('connection', handleAdminConnection);
  // io.on('connection', handleUserConnection);
  io.use(authenticateAdmin).on('connection', (socket) => {
    console.log('✅ Admin connected:', socket.id);
    handleAdminConnection(socket, io);
  });
  // ✅ اتصال کاربر عادی
  io.on('connection', (socket) => {
  // ✅ فقط اگر isAdmin نباشه
    if (!socket.decoded?.admin) {
      handleUserConnection(socket, io);
    }
  });
}