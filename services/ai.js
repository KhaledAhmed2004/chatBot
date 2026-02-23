const axios = require("axios");

// Per-user chat history (in-memory)
const chatHistories = new Map();
const MAX_HISTORY = 20;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes per user

const SYSTEM_PROMPT = `Tu ekta WhatsApp AI chatbot. Tomar naam "ShopBot".
Tu Bangla, English, Banglish - shob bujhish ar reply dite parish.

Tomar kaj:
1. User ja bolbe setar intelligent reply dibe
2. Friendly ar helpful thakbi
3. Bangla te question ashle Bangla te reply dibe, English e ashle English e
4. Short ar clear reply dibe (WhatsApp message, 200 word er moddhe)
5. Tumi product related help o korte paro

Commands info (user jodi command jigges kore):
- "products" - product list dekhay
- "add [id]" - cart e add kore
- "cart" - cart dekhay
- "order" - order place kore
- "help" - sob commands

Rules:
- Respectful thakbi sobsomoy
- Inappropriate content e reply korbi na
- Lamba reply diyona, concise rakhbi`;

function getUserHistory(userId) {
  if (!chatHistories.has(userId)) {
    chatHistories.set(userId, { messages: [], lastActive: Date.now() });
  }
  const session = chatHistories.get(userId);
  session.lastActive = Date.now();
  return session.messages;
}

async function getAIReply(userId, userMessage) {
  // Try Groq first, then Gemini as fallback
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey && groqKey !== "your_groq_api_key_here") {
    const reply = await callGroq(userId, userMessage, groqKey);
    if (reply) return reply;
  }

  // Fallback to Gemini if Groq failed or not configured
  if (geminiKey && geminiKey !== "your_gemini_api_key_here") {
    return await callGemini(userId, userMessage, geminiKey);
  }

  return (
    `AI setup kora hoyni. Admin ke bolun API key add korte.\n\n` +
    `Ekhon commands use korte paro:\n` +
    `- *products* - Product dekhao\n` +
    `- *help* - Sob commands`
  );
}

// ===== GROQ (PRIMARY - FREE, FAST) =====
async function callGroq(userId, userMessage, apiKey) {
  try {
    const history = getUserHistory(userId);

    history.push({ role: "user", content: userMessage });

    // Keep history within limit
    if (history.length > MAX_HISTORY) {
      history.splice(0, history.length - MAX_HISTORY);
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const reply = response.data.choices[0].message.content;
    history.push({ role: "assistant", content: reply });

    return reply;
  } catch (error) {
    console.error(
      "Groq AI error:",
      error.response?.data?.error?.message || error.message
    );
    chatHistories.delete(userId);

    if (error.response?.status === 429) {
      return `AI rate limit. Ektu pore abar try koro.\n\nEkhon *help* type koro commands dekhte.`;
    }

    // Return null so fallback to Gemini
    return null;
  }
}

// ===== GEMINI (FALLBACK - FREE) =====
async function callGemini(userId, userMessage, apiKey) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(
      SYSTEM_PROMPT + "\n\nUser: " + userMessage
    );
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI error:", error.message);

    if (error.message.includes("429") || error.message.includes("quota")) {
      return `AI daily limit shesh. Kalke abar try koro.\n\nEkhon *help* type koro commands dekhte.`;
    }

    return `AI te problem hosche. Ektu pore try koro.\n\nEkhon *help* type koro commands dekhte.`;
  }
}

// Cleanup inactive sessions (per-user timeout, not all at once)
setInterval(() => {
  const now = Date.now();
  for (const [userId, session] of chatHistories) {
    if (now - session.lastActive > SESSION_TIMEOUT) {
      chatHistories.delete(userId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

module.exports = { getAIReply };
