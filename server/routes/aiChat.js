// server/routes/aiChat.js
import express from "express";
import axios from "axios";

const router = express.Router();

// Groq API configuration (Free and fast AI)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// AI Chat endpoint
router.post("/ai-chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "MISSING_MESSAGE",
      });
    }

    // Check if Groq API key is configured
    if (!GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "API_KEY_NOT_CONFIGURED"
      });
    }

    // Call Groq API (Free and fast AI)
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192", // Fast and free model
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant for Hamidreza Delshad's portfolio website. 

ABOUT HAMIDREZA:
- Full Stack Developer with 3+ years experience
- Master's in Bioinformatics from University of Skövde, Sweden
- Currently based in Sweden
- Expertise: React.js, Next.js, Node.js, Express.js, MongoDB, TypeScript, Tailwind CSS
- Experience at: Signum Framework, Hantverkshjälpen AB, Integrify Academy
- Key Projects: Kajutan Restaurant Website, Blog App with Admin Panel, Job Portal, Time Flow Management System
- Contact: delshad.swdn@gmail.com, LinkedIn: hamidreza-delshad

INSTRUCTIONS:
- Keep responses helpful, professional, and concise (max 150 words)
- Always respond in the same language as the user's question (Persian/Farsi, English, or Swedish)
- For Persian responses, use proper Persian grammar and be respectful
- If asked about topics outside Hamidreza's expertise, politely redirect to relevant information about him
- Encourage users to contact Hamidreza directly for detailed discussions`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        stream: false
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);

    let errorCode = "PROCESSING_ERROR";
    
    if (error.response?.status === 429) {
      errorCode = "QUOTA_EXCEEDED";
    } else if (error.response?.status === 401) {
      errorCode = "INVALID_API_KEY";
    }

    res.status(error.response?.status || 500).json({
      success: false,
      error: errorCode
    });
  }
});

export default router;
