// server/routes/aiChat.js
import express from "express";
import axios from "axios";

const router = express.Router();

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    // Check if API key is configured
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "API_KEY_NOT_CONFIGURED",
      });
    }

    // Call OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant for Hamidreza Delshad's portfolio website. 
            You can help visitors with questions about:
            - Hamidreza's skills and experience as a Full Stack Developer
            - His projects and work (React, Node.js, TypeScript, MongoDB, etc.)
            - Web development topics and best practices
            - General programming questions
            - Career advice in tech
            - His background: Master's in Bioinformatics from University of Skövde, Sweden
            - His experience: Frontend Developer at Signum Framework, Hantverkshjälpen AB, Integrify Academy
            - His location: Currently in Sweden
            - His expertise: React.js, Next.js, Node.js, Express.js, MongoDB, TypeScript, Tailwind CSS
            
            Keep responses helpful, professional, and concise (max 200 words). 
            If asked about topics outside your expertise, politely redirect to relevant information about Hamidreza or suggest contacting him directly.
            
            Always respond in the same language as the user's question (Persian/Farsi or English).
            For Persian responses, use proper Persian grammar and be respectful.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);

    let errorCode = "PROCESSING_ERROR";

    if (error.response?.status === 429 || error.code === "insufficient_quota") {
      errorCode = "QUOTA_EXCEEDED";
    } else if (
      error.response?.status === 401 ||
      error.code === "invalid_api_key"
    ) {
      errorCode = "INVALID_API_KEY";
    }

    res.status(error.response?.status || 500).json({
      success: false,
      error: errorCode,
    });
  }
});

export default router;
