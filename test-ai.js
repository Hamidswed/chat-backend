// test-ai.js - Script for testing AI endpoint
import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testAIEndpoint() {
  console.log('🤖 Testing AI Chat Endpoint...\n');

  const testMessages = [
    'Hello! Can you tell me about Hamidreza?',
    'سلام! می‌تونی درباره مهارت‌های حمیدرضا بگی؟',
    'What technologies does he work with?',
    'چه پروژه‌هایی انجام داده؟'
  ];

  for (const message of testMessages) {
    try {
      console.log(`📤 Sending: "${message}"`);
      
      const response = await axios.post(`${BASE_URL}/api/ai-chat`, {
        message: message
      });

      console.log(`📥 Response: "${response.data.response}"`);
      console.log('─'.repeat(80));
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error: ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.response) {
        console.log(`📥 Fallback Response: "${error.response.data.response}"`);
      }
      console.log('─'.repeat(80));
    }
  }
}

// Test basic server connection first
async function testServerConnection() {
  try {
    console.log('🔌 Testing server connection...');
    const response = await axios.get(`${BASE_URL}/api`);
    console.log(`✅ Server Status: ${response.data.status}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Server connection failed: ${error.message}`);
    console.log('Make sure the server is running with: npm start\n');
    return false;
  }
}

// Main test function
async function runTests() {
  const serverOk = await testServerConnection();
  
  if (serverOk) {
    await testAIEndpoint();
  }
  
  console.log('\n🏁 Test completed!');
  console.log('\nTips:');
  console.log('- Make sure you have set OPENAI_API_KEY in your .env file');
  console.log('- Check the server logs for any errors');
  console.log('- Verify your OpenAI API key has sufficient credits');
}

runTests().catch(console.error);