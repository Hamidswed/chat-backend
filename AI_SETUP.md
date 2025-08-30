# 🤖 AI Assistant Setup - Backend

این راهنما نحوه راه‌اندازی دستیار هوشمند در backend را توضیح می‌دهد.

## 📁 ساختار فایل‌های اضافه شده

```
chat-backend/
├── server/
│   └── routes/
│       └── aiChat.js          # Route handler برای AI chat
├── .env.example               # نمونه فایل environment variables
└── AI_SETUP.md               # این فایل راهنما
```

## 🚀 راه‌اندازی سریع

### 1. تنظیم Environment Variables

```bash
# در دایرکتوری chat-backend
cp .env.example .env
```

سپس فایل `.env` را ویرایش کنید:

```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
PORT=4000
```

### 2. دریافت OpenAI API Key

1. به [OpenAI Platform](https://platform.openai.com/api-keys) بروید
2. حساب کاربری ایجاد کنید
3. API key جدید بسازید
4. آن را در فایل `.env` قرار دهید

### 3. اجرای سرور

```bash
# نصب dependencies (اگر قبلاً نصب نکرده‌اید)
npm install

# اجرای سرور
npm start
```

## 🔧 جزئیات فنی

### API Endpoint

```
POST /api/ai-chat
Content-Type: application/json

{
  "message": "سوال کاربر"
}
```

### Response Format

```json
{
  "response": "پاسخ دستیار هوشمند"
}
```

### Error Handling

- اگر API key تنظیم نشده باشد، پیام خطای مناسب برمی‌گرداند
- در صورت خطا در OpenAI API، پاسخ fallback ارسال می‌شود
- تشخیص زبان خودکار برای پاسخ‌های خطا

### AI Configuration

- **Model**: GPT-3.5-turbo
- **Max Tokens**: 500
- **Temperature**: 0.7
- **System Prompt**: تنظیم شده برای پاسخ‌دهی درباره حمیدرضا دلشاد

## 🛡️ امنیت

- API key در متغیرهای محیطی نگهداری می‌شود
- CORS تنظیم شده برای دامنه‌های مجاز
- Validation ورودی‌ها
- Error handling مناسب

## 🔄 سفارشی‌سازی

### تغییر مدل AI

در فایل `server/routes/aiChat.js`:

```javascript
model: 'gpt-4', // یا هر مدل دیگری
```

### تنظیم System Prompt

```javascript
{
  role: 'system',
  content: `شخصیت و دانش دستیار را اینجا تعریف کنید...`
}
```

### تنظیم پارامترهای AI

```javascript
max_tokens: 300,     // کاهش برای پاسخ‌های کوتاه‌تر
temperature: 0.5,    // کاهش برای پاسخ‌های قطعی‌تر
```

## 🐛 عیب‌یابی

### خطای "API key not configured"

```bash
# بررسی کنید که فایل .env در chat-backend وجود دارد
ls -la chat-backend/.env

# محتوای فایل را بررسی کنید
cat chat-backend/.env
```

### خطای CORS

اگر از دامنه جدیدی استفاده می‌کنید، آن را به `server/app.js` اضافه کنید:

```javascript
app.use(
  cors({
    origin: ["http://localhost:5173", "https://hdelshad.com", "https://your-domain.com"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);
```

### مشکلات عملکرد

- Rate limiting OpenAI را در نظر بگیرید
- برای پروژه‌های بزرگ، caching پیاده‌سازی کنید
- Token usage را مانیتور کنید

## 📊 مانیتورینگ

برای مانیتور کردن استفاده از API:

```javascript
console.log('AI Request:', { message, timestamp: new Date() });
console.log('AI Response tokens:', response.data.usage);
```

## 💰 هزینه‌ها

- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- محدودیت‌های rate limiting را در نظر بگیرید

---

**نکته مهم**: همیشه API key خود را امن نگه دارید و آن را در کد commit نکنید!