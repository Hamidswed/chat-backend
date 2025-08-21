// server/app.js
import express from 'express';
import adminAuthRouter from './routes/adminAuth.js';

const app = express();

app.use(express.json());
app.use('/api/admin', adminAuthRouter);
app.use('/admin', express.static('admin'));

app.get('/api', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

export default app;