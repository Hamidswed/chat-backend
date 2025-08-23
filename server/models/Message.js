// server/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  from: { type: String, enum: ['user', 'admin'], required: true },
  text: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);