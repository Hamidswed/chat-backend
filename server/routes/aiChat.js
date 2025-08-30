// server/routes/aiChat.js
import express from "express";

const router = express.Router();

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

    // Simple rule-based AI responses (No external API needed - completely free)
    const isFarsi = /[\u0600-\u06FF]/.test(message);
    const isSwedish = /\b(hej|tack|svenska|sverige)\b/i.test(message);
    
    let aiResponse = "";
    
    // Simple keyword matching for common questions
    const lowerMessage = message.toLowerCase();
    
    if (isFarsi) {
      if (lowerMessage.includes('سلام') || lowerMessage.includes('درود')) {
        aiResponse = "سلام! من دستیار هوشمند حمیدرضا دلشاد هستم. حمیدرضا یک توسعه‌دهنده فول‌استک با تخصص در React.js، Node.js، TypeScript و MongoDB است. چطور می‌تونم کمکتون کنم؟";
      } else if (lowerMessage.includes('مهارت') || lowerMessage.includes('تکنولوژی')) {
        aiResponse = "حمیدرضا در تکنولوژی‌های زیر تخصص دارد:\n• Frontend: React.js, Next.js, TypeScript, Tailwind CSS\n• Backend: Node.js, Express.js\n• Database: MongoDB\n• Tools: Docker, AWS, Git\n• Design: Figma, Adobe Creative Suite";
      } else if (lowerMessage.includes('پروژه') || lowerMessage.includes('نمونه کار')) {
        aiResponse = "حمیدرضا روی پروژه‌های مختلفی کار کرده شامل:\n• وبسایت رستوران کایوتان (React + Node.js)\n• اپلیکیشن وبلاگ با پنل مدیریت\n• پورتال استخدام\n• سیستم مدیریت زمان Time Flow\nبرای مشاهده جزئیات بیشتر، بخش پروژه‌ها را ببینید.";
      } else if (lowerMessage.includes('تماس') || lowerMessage.includes('ارتباط')) {
        aiResponse = "می‌تونید از طریق راه‌های زیر با حمیدرضا در تماس باشید:\n• ایمیل: delshad.swdn@gmail.com\n• LinkedIn: linkedin.com/in/hamidreza-delshad\n• GitHub: github.com/hamidreza-delshad\n• یا از طریق فرم تماس در همین سایت";
      } else {
        aiResponse = "سوال جالبی پرسیدید! حمیدرضا یک توسعه‌دهنده فول‌استک با بیش از 3 سال تجربه است. برای اطلاعات بیشتر می‌تونید از طریق چت انسانی یا فرم تماس با ایشان صحبت کنید.";
      }
    } else if (isSwedish) {
      if (lowerMessage.includes('hej') || lowerMessage.includes('hallo')) {
        aiResponse = "Hej! Jag är Hamidrezas AI-assistent. Hamidreza är en fullstack-utvecklare med expertis inom React.js, Node.js, TypeScript och MongoDB. Hur kan jag hjälpa dig?";
      } else if (lowerMessage.includes('färdighet') || lowerMessage.includes('teknologi')) {
        aiResponse = "Hamidreza har expertis inom:\n• Frontend: React.js, Next.js, TypeScript, Tailwind CSS\n• Backend: Node.js, Express.js\n• Databas: MongoDB\n• Verktyg: Docker, AWS, Git\n• Design: Figma, Adobe Creative Suite";
      } else if (lowerMessage.includes('projekt')) {
        aiResponse = "Hamidreza har arbetat med olika projekt:\n• Kajutan restaurangwebbplats (React + Node.js)\n• Bloggapplikation med adminpanel\n• Jobbportal\n• Time Flow tidshanteringssystem\nSe projektavsnittet för mer information.";
      } else if (lowerMessage.includes('kontakt')) {
        aiResponse = "Du kan kontakta Hamidreza via:\n• E-post: delshad.swdn@gmail.com\n• LinkedIn: linkedin.com/in/hamidreza-delshad\n• GitHub: github.com/hamidreza-delshad\n• Eller genom kontaktformuläret på denna webbplats";
      } else {
        aiResponse = "Intressant fråga! Hamidreza är en fullstack-utvecklare med över 3 års erfarenhet. För mer information kan du chatta med honom direkt eller använda kontaktformuläret.";
      }
    } else {
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        aiResponse = "Hello! I'm Hamidreza's AI assistant. Hamidreza is a full-stack developer with expertise in React.js, Node.js, TypeScript, and MongoDB. How can I help you today?";
      } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('tech')) {
        aiResponse = "Hamidreza has expertise in:\n• Frontend: React.js, Next.js, TypeScript, Tailwind CSS\n• Backend: Node.js, Express.js\n• Database: MongoDB\n• Tools: Docker, AWS, Git\n• Design: Figma, Adobe Creative Suite\n\nHe also has a Master's degree in Bioinformatics from University of Skövde, Sweden.";
      } else if (lowerMessage.includes('project') || lowerMessage.includes('work') || lowerMessage.includes('portfolio')) {
        aiResponse = "Hamidreza has worked on various projects including:\n• Kajutan Restaurant Website (React + Node.js)\n• Blog Application with Admin Panel\n• Job Portal Platform\n• Time Flow Management System\n\nYou can see more details in the projects section of this website.";
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email')) {
        aiResponse = "You can contact Hamidreza through:\n• Email: delshad.swdn@gmail.com\n• LinkedIn: linkedin.com/in/hamidreza-delshad\n• GitHub: github.com/hamidreza-delshad\n• Or use the contact form on this website";
      } else if (lowerMessage.includes('experience') || lowerMessage.includes('background')) {
        aiResponse = "Hamidreza has over 3 years of experience as a full-stack developer. He has worked at:\n• Signum Framework (Frontend Developer)\n• Hantverkshjälpen AB (Frontend Developer)\n• Integrify Academy (Full-stack Developer Trainee)\n\nHe's currently based in Sweden and specializes in modern web technologies.";
      } else {
        aiResponse = "That's an interesting question! Hamidreza is a passionate full-stack developer with over 3 years of experience. For more detailed information, feel free to chat with him directly through human chat or use the contact form.";
      }
    }
    res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error("AI Chat Error:", error.message);

    // Fallback response when API fails
    const isFarsi = /[\u0600-\u06FF]/.test(message);
    const isSwedish = /\b(hej|tack|svenska|sverige)\b/i.test(message);
    
    let fallbackResponse = "";
    if (isFarsi) {
      fallbackResponse = "سلام! متأسفانه در حال حاضر مشکل فنی دارم، اما می‌تونید سوالتون رو از طریق چت انسانی یا فرم تماس بپرسید. حمیدرضا یک توسعه‌دهنده فول‌استک با تخصص در React، Node.js و TypeScript هست.";
    } else if (isSwedish) {
      fallbackResponse = "Hej! Tyvärr har jag tekniska problem just nu, men du kan ställa din fråga via mänsklig chatt eller kontaktformuläret. Hamidreza är en fullstack-utvecklare med expertis inom React, Node.js och TypeScript.";
    } else {
      fallbackResponse = "Hello! I'm having technical difficulties right now, but you can ask your question through human chat or the contact form. Hamidreza is a full-stack developer with expertise in React, Node.js, and TypeScript.";
    }

    res.json({
      success: true,
      response: fallbackResponse,
    });
  }
});

export default router;
