# WhatsApp AI Chatbot + E-commerce Bot

WhatsApp Cloud API + Groq AI (Llama 3.3) + Google Gemini + E-commerce system দিয়ে তৈরি chatbot।

---

## সম্পূর্ণ Setup Guide (ধাপে ধাপে - বাংলিশ)

---

### ✅ Step 1: Node.js Install (যদি আগে থেকে না থাকে)

1. যাও: https://nodejs.org
2. LTS version download করো
3. Install করো
4. Terminal এ check করো:
```bash
node --version
npm --version
```
**আমরা এটা আগেই করেছি।**

---

### ✅ Step 2: Project Setup

1. Project folder এ যাও:
```bash
cd d:/claude/chatBot
```
2. Dependencies install করো:
```bash
npm install
```
**আমরা এটাও আগেই করেছি।** এটা `express`, `axios`, `dotenv`, `@google/generative-ai` install করে।

---

### ✅ Step 3: AI API Keys Setup (FREE)

আমাদের bot এ **2টা AI provider** আছে। Groq primary, Gemini fallback:

#### 3a. Groq API Key (Primary AI - FREE)
1. যাও: https://console.groq.com/keys
2. Google/GitHub দিয়ে Sign Up করো
3. **"Create API Key"** click করো
4. Key কপি করো
5. `.env` ফাইলে বসাও: `GROQ_API_KEY=তোমার_key`

**আমরা এটা করেছি।**

#### 3b. Google Gemini API Key (Fallback AI - FREE)
1. যাও: https://aistudio.google.com/apikey
2. Google account দিয়ে login করো
3. **"Create API Key"** click করো
4. Key কপি করো
5. `.env` ফাইলে বসাও: `GEMINI_API_KEY=তোমার_key`

**আমরা এটা করেছি।**

#### AI Providers তুলনা:
| | Groq (Primary) | Gemini (Fallback) |
|---|---|---|
| Model | Llama 3.3 70B | Gemini 2.0 Flash |
| Speed | Super Fast | Normal |
| Free Limit | 14,400/day | 1,500/day |
| Bangla | অনেক ভালো | ভালো |
| Chat Memory | হ্যাঁ (per user) | না |
| Cost | FREE | FREE |

> Bot আগে Groq try করে। Groq fail হলে automatically Gemini ব্যবহার করে। দুটোই fail হলে user কে commands ব্যবহার করতে বলে।

---

### ✅ Step 4: Meta Developer Account তৈরি করো

1. যাও: https://developers.facebook.com
2. তোমার **Facebook account** দিয়ে login করো
3. উপরে ডানদিকে **"My Apps"** click করো
4. **"Create App"** click করো
5. App type: **"Business"** select করো → Next
6. App name দাও: যেমন `My WhatsApp Bot`
7. Contact email দাও
8. **"Create App"** click করো

**আমরা এটা করেছি।**

---

### ✅ Step 5: WhatsApp Product Add করো

1. App Dashboard এ আসবে
2. নিচে scroll করো, **"WhatsApp"** খুঁজে বের করো
3. **"Set Up"** button click করো
4. একটা **test phone number** automatically তৈরি হবে

**আমরা এটা করেছি।**

---

### ✅ Step 6: API Credentials কপি করো

1. Left sidebar এ: **WhatsApp → API Setup** যাও
2. কপি করো:
   - **Phone Number ID** (নিচে "From" section এ আছে)
   - **Temporary Access Token** (উপরে আছে)
3. `.env` ফাইলে বসাও:
```
PHONE_NUMBER_ID=তোমার_phone_number_id
ACCESS_TOKEN=তোমার_access_token
```

**আমরা এটা করেছি।**

> ⚠️ **Note:** Temporary Access Token 24 ঘণ্টা পর expire হয়। নতুন token নিতে হলে আবার API Setup page থেকে কপি করো।

---

### ✅ Step 7: Cloudflare Tunnel Install করো

আমাদের PC কে internet এ public করতে হবে যাতে Meta আমাদের server এ message পাঠাতে পারে।

```bash
npm install -g cloudflared
```

**আমরা এটা করেছি।**

> ngrok ব্যবহার করিনি কারণ free tier এ browser warning page দেখায় যেটা Meta এর webhook verify block করে দেয়।

---

### ✅ Step 8: Bot Server চালাও (Terminal 1)

```bash
cd d:/claude/chatBot
npm start
```

Output আসবে:
```
Server running on port 4000
Webhook URL: http://localhost:4000/webhook
```

> ⚠️ **Important:** Port 4000 ব্যবহার করছি কারণ port 3000 এ অন্য app (Next.js) চলছিলো। `.env` ফাইলে `PORT=4000` সেট করা আছে।

**আমরা এটা করেছি।**

---

### ✅ Step 9: Cloudflare Tunnel চালাও (Terminal 2 - আলাদা terminal)

```bash
npx cloudflared tunnel --url http://localhost:4000
```

Output এ একটা URL পাবে:
```
https://something-random.trycloudflare.com
```

**এই URL টা কপি করে রাখো!**

> ⚠️ **Note:** প্রতিবার cloudflared চালালে নতুন URL আসে।

**আমরা এটা করেছি।**

---

### ✅ Step 10: Meta Dashboard এ Webhook Configure করো

1. Meta Developer Dashboard এ যাও
2. **WhatsApp → Configuration** click করো
3. **"Edit"** button click করো
4. এগুলো দাও:

| Field | Value |
|---|---|
| **Callback URL** | `https://তোমার-cloudflare-url.trycloudflare.com/webhook` |
| **Verify Token** | `my_secret_verify_token_123` |

5. **"Verify and Save"** click করো
6. নিচে **"Webhook fields"** এ **"messages"** toggle **ON** করো (Subscribe)

> ⚠️ **Important:** Verify and Save করার সময় দুটো terminal ই চালু থাকতে হবে (npm start + cloudflared)।

**আমরা এটা করেছি।**

---

### ✅ Step 11: Test করো!

1. Meta Dashboard → **WhatsApp → API Setup** এ যাও
2. **"To"** field এ তোমার নিজের WhatsApp number দাও
3. **"Send Message"** click করো (এটা তোমার number whitelist করবে)
4. এখন তোমার WhatsApp থেকে **test number এ message পাঠাও**

**আমরা এটা করেছি!**

---

## Bot কিভাবে কাজ করে (Architecture)

### Message Flow:
```
User WhatsApp এ message পাঠায় (যেমন "তুমি কে?")
    ↓
WhatsApp সেটা Meta Server এ পাঠায়
    ↓
Meta তোমার Cloudflare URL এ POST request পাঠায়
    ↓
Cloudflare Tunnel সেটা তোমার PC (localhost:4000) এ পাঠায়
    ↓
index.js সেটা receive করে → messageHandler.js এ পাঠায়
    ↓
messageHandler.js দেখে কী লেখা:
  - "hi/hello/help" → Instant reply দেয়
  - "products/add/cart/order" → store.js handle করে (E-commerce)
  - অন্য কিছু → ai.js এ পাঠায় (Groq/Gemini AI reply)
    ↓
whatsapp.js সেই reply Meta API দিয়ে পাঠায়
    ↓
User WhatsApp এ reply পায়!
```

### AI System কিভাবে কাজ করে:
```
User message আসলো → ai.js এ যায়
    ↓
Groq API Key আছে? → হ্যাঁ → Groq (Llama 3.3) ব্যবহার করে (FAST!)
    ↓                   ↓
    না              Groq fail?
    ↓                   ↓
Gemini API Key আছে? → হ্যাঁ → Gemini ব্যবহার করে
    ↓                   ↓
    না              Gemini ও fail?
    ↓                   ↓
"API key add করো"    "AI busy, commands use করো" message দেয়
```

### কোন ফাইল কী করে:
| ফাইল | কাজ |
|---|---|
| **index.js** | Server চালায়, Meta থেকে message receive করে, webhook verify করে |
| **handlers/messageHandler.js** | Message দেখে decide করে কোন reply দিবে - command নাকি AI |
| **services/ai.js** | AI manager - Groq (primary) + Gemini (fallback) handle করে |
| **services/gemini.js** | Google Gemini AI (standalone, backup রাখা আছে) |
| **services/whatsapp.js** | Meta API দিয়ে WhatsApp এ reply পাঠায় (text, image, button) |
| **services/store.js** | Product list, cart manage, order place করে |
| **data/products.json** | সব product এর data রাখে (name, price, stock) |

### 3টা Main Feature:

**1. Smart AI Chat (Groq + Gemini):**
যেকোনো text Bangla/English/Banglish এ লিখলে AI বুঝে intelligent reply দেয়। Chat memory আছে - আগের কথা মনে রাখে। Groq primary (fast), Gemini fallback।

**2. E-commerce System:**
"products", "add 1", "cart", "order" - store.js handle করে। প্রতিটা user এর আলাদা cart থাকে memory তে।

**3. Normal Commands (Instant reply):**
"hi", "help", "time" - এগুলো instantly reply দেয়। কোনো AI লাগে না। Bangla keywords ও কাজ করে (যেমন "দেখাও", "পণ্য", "অর্ডার")।

---

## Bot Commands (যা যা করতে পারে)

### 🛒 E-commerce Commands:
| Command | Alternatives | কী করে |
|---|---|---|
| `products` | product, shop, store, item, list, show, দেখাও, পণ্য | সব product এর list দেখায় |
| `details 1` | detail 1 | Product #1 এর বিস্তারিত |
| `add 1` | - | Product #1 cart এ add করো |
| `add 1 3` | - | Product #1, 3টা cart এ add করো |
| `cart` | কার্ট, bag | Cart দেখো (total সহ) |
| `remove 1` | - | Product #1 cart থেকে remove |
| `clear cart` | empty cart, delete cart | পুরো cart খালি করো |
| `order` | checkout, buy, অর্ডার, কিনতে | Order place করো (Order ID পাবে) |

### 🤖 AI Chat:
| Command | কী করে |
|---|---|
| `ai তুমি কে?` | AI কে প্রশ্ন করো (ai prefix দিয়ে) |
| যেকোনো text | AI automatically reply দেবে (Bangla/English/Banglish) |

### 📋 Other Commands:
| Command | Alternatives | কী করে |
|---|---|---|
| `hi` | hello, hey, assalamualaikum, salam, হাই, হ্যালো | Greeting + menu দেখায় |
| `help` | menu, command, হেল্প, কমান্ড | সব commands এর list |
| `time` | সময়, clock, টাইম | Bangladesh এর current time |

---

## Project Structure

```
chatBot/
├── index.js                    # Main server (Express + Webhook)
├── handlers/
│   └── messageHandler.js       # Message handling + command routing
├── services/
│   ├── ai.js                   # AI manager (Groq primary + Gemini fallback)
│   ├── gemini.js               # Google Gemini AI (standalone backup)
│   ├── whatsapp.js             # WhatsApp Cloud API calls
│   └── store.js                # E-commerce (cart, order, products)
├── data/
│   └── products.json           # Product list (edit করে নিজের product দাও)
├── .env                        # Secret keys (git এ push করো না!)
├── .gitignore                  # .env আর node_modules ignore করে
├── package.json                # Dependencies
└── README.md                   # এই file
```

---

## .env ফাইলে যা যা আছে

```
PHONE_NUMBER_ID=xxxxx           # Meta Dashboard থেকে
ACCESS_TOKEN=xxxxx              # Meta Dashboard থেকে (24hr এ expire হয়)
VERIFY_TOKEN=my_secret_verify_token_123  # Webhook verify এর জন্য
GROQ_API_KEY=gsk_xxxxx          # Groq থেকে (Primary AI)
GEMINI_API_KEY=AIzaSyxxxxx      # Google AI Studio থেকে (Fallback AI)
PORT=4000                       # Server port
```

---

## AI Provider Switch করতে চাইলে

### শুধু Groq ব্যবহার করতে চাইলে:
`.env` এ `GEMINI_API_KEY` line delete করো বা empty রাখো।

### শুধু Gemini ব্যবহার করতে চাইলে:
`.env` এ `GROQ_API_KEY` line delete করো বা empty রাখো।

### দুটোই রাখলে (recommended):
Groq আগে try করবে → fail হলে Gemini try করবে → দুটোই fail হলে error message দিবে।

---

## নিজের Product Add করতে চাইলে

`data/products.json` ফাইল edit করো:

```json
{
  "id": 7,
  "name": "Your Product Name",
  "name_bn": "তোমার প্রোডাক্টের নাম",
  "price": 500,
  "category": "category_name",
  "description": "Product description here",
  "stock": 10
}
```

---

## নতুন Command Add করতে চাইলে

`handlers/messageHandler.js` ফাইলে `handleTextMessage` function এ add করো:

```javascript
// Flexible matching (multiple keywords)
if (containsAny(lowerText, ["your_word", "another_word", "তোমার_শব্দ"])) {
  return "Your response here!";
}
```

---

## প্রতিবার Bot চালাতে যা করতে হবে

প্রতিবার PC restart এর পর বা আবার চালাতে চাইলে:

1. **Terminal 1:** `cd d:/claude/chatBot && npm start`
2. **Terminal 2:** `npx cloudflared tunnel --url http://localhost:4000`
3. নতুন cloudflare URL কপি করে Meta Dashboard এ webhook update করো
4. Test message পাঠাও

> ⚠️ Access Token expire হলে (24 ঘণ্টা পর) Meta Dashboard থেকে নতুন token নিয়ে `.env` ফাইলে update করো।

---

## CEO / অন্য কেউ Test করতে চাইলে (No Coding Required)

তোমার CEO বা অন্য কাউকে test করাতে চাইলে, তাদেরকে শুধু এটুকু বলো:

### তাদের জন্য Steps:

**Step 1:** তাদের WhatsApp number তোমাকে দিতে হবে (country code সহ, যেমন: `8801XXXXXXXXX`)

**Step 2:** তুমি (Developer) এই কাজটা করবে:
1. Meta Developer Dashboard → **WhatsApp → API Setup** এ যাও
2. **"To"** field এ তাদের WhatsApp number দাও
3. **"Manage phone number list"** এ গিয়ে তাদের number add করো
4. **"Send Message"** click করো
5. তারা WhatsApp এ একটা template message পাবে

**Step 3:** তারা (CEO) শুধু এটুকু করবে:
1. WhatsApp এ bot এর number থেকে একটা message আসবে
2. সেই chat এ গিয়ে reply করবে
3. এই messages গুলো test করবে:

```
hi              → Greeting + menu দেখবে
products        → Product list দেখবে
add 1           → Cart এ product add হবে
cart            → Cart দেখবে
order           → Order confirm হবে
তুমি কে?        → AI reply পাবে (Bangla)
what can you do? → AI reply পাবে (English)
```

> ⚠️ **Important Notes:**
> - Bot শুধু তখনই কাজ করবে যখন তোমার PC তে `npm start` + `cloudflared` দুটোই চালু থাকবে
> - Test mode এ সর্বোচ্চ **5টা phone number** add করা যায়
> - Production এ যেতে হলে Meta Business Verification করতে হবে
> - Temporary Access Token 24 ঘণ্টায় expire হয়, নতুন token নিতে হবে

### CEO কে কপি-পেস্ট করে পাঠানোর জন্য Message:

```
আমি একটা WhatsApp AI Chatbot বানিয়েছি! Test করে দেখো:

1. আমি তোমার number add করে দিচ্ছি
2. WhatsApp এ একটা message আসবে bot থেকে
3. সেখানে reply করো:
   - "hi" লিখো → greeting পাবে
   - "products" লিখো → product list দেখবে
   - "add 1" লিখো → cart এ add হবে
   - "cart" লিখো → cart দেখবে
   - "order" লিখো → order হবে
   - যেকোনো প্রশ্ন লিখো → AI reply দিবে!
   - Bangla, English, Banglish সব বোঝে!

Try it out!
```

---

## সমস্যা ও সমাধান (Troubleshooting)

| সমস্যা | সমাধান |
|---|---|
| Port 3000 already in use | `.env` এ `PORT=4000` দাও (আমরা করেছি) |
| ngrok warning page | cloudflared ব্যবহার করো (আমরা করেছি) |
| Webhook verify fail | দুটো terminal ই চালু আছে কিনা check করো |
| Access Token expired | Meta Dashboard → API Setup থেকে নতুন token নাও |
| Bot reply দিচ্ছে না | npm start terminal এ error log check করো |
| Groq AI কাজ করছে না | GROQ_API_KEY ঠিক আছে কিনা check করো |
| Gemini AI quota শেষ | Groq ব্যবহার করো (`.env` এ GROQ_API_KEY দাও) |
| দুটো AI ই fail | API keys check করো, internet connection check করো |

---

## Update History

| তারিখ | কী করা হয়েছে |
|---|---|
| Initial | Basic WhatsApp bot with commands (hi, help, time, joke) |
| Update 1 | E-commerce system add করা হয়েছে (products, cart, order) |
| Update 2 | Google Gemini AI integration (smart chat) |
| Update 3 | Flexible command matching (Bangla keywords support) |
| Update 4 | Groq AI add করা হয়েছে (primary, faster, better Bangla) |
| Update 4 | Dual AI system - Groq primary + Gemini fallback |
| Update 4 | Better error handling for AI failures |
