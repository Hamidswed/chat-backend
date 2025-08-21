/* eslint-disable no-undef */
// server/routes/adminAuth.js
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ admin: true }, ADMIN_JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

export default router;