// server/app.js
import express from "express";
import adminAuthRouter from "./routes/adminAuth.js";
import aiChatRouter from "./routes/aiChat.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://hdelshad.com"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

// Middlewareهای ضروری
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// روت ورود ادمین
app.use("/api/admin", adminAuthRouter);

// روت AI چت
app.use("/api", aiChatRouter);

// روت تست
app.get("/api", (req, res) => {
  res.json({ status: "Backend is running!" });
});

export default app;
