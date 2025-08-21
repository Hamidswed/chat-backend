// server/app.js
import express from 'express';
import adminAuthRouter from './routes/adminAuth.js';

const app = express();

// Middlewareهای ضروری
app.use(express.json());

// روت ورود ادمین
app.use('/api/admin', adminAuthRouter);

// روت تست
app.get('/api', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

export default app;