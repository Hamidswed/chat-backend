/* eslint-disable no-undef */
// server/sockets/authMiddleware.js
import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

export const authenticateAdmin = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, ADMIN_JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.decoded = decoded;
    next();
  });
};