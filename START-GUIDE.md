# WhatsApp Bot - Start করার Guide

## Prerequisites (আগে যা লাগবে)

1. **Node.js** installed থাকতে হবে (v18+)
2. **Meta Developer Account** - https://developers.facebook.com
3. **WhatsApp Business App** Meta Dashboard এ তৈরি করা থাকতে হবে
4. **Groq API Key** (FREE) - https://console.groq.com/keys
5. **Gemini API Key** (FREE) - https://aistudio.google.com/apikey

---

## Step 1: `.env` ফাইল Configure করো

`.env` ফাইলে নিচের values গুলো সেট করো:

```env
# Meta Developer Dashboard থেকে পাবে
PHONE_NUMBER_ID=তোমার_phone_number_id
ACCESS_TOKEN=তোমার_permanent_access_token

# যেকোনো secret word দাও (webhook verify করতে লাগবে)
VERIFY_TOKEN=my_secret_verify_token_123

# AI API Keys
GROQ_API_KEY=তোমার_groq_api_key
GEMINI_API_KEY=তোমার_gemini_api_key

# তোমার WhatsApp number (order notification পাবে)
ADMIN_NUMBER=8801XXXXXXXXX

# Server port
PORT=4000
```

---

## Step 2: Dependencies Install করো

```bash
npm install
```

---

## Step 3: Server Start করো

```bash
# Normal start
npm start

# Development mode (code change করলে auto-restart হবে)
npm run dev
```

Server চালু হলে দেখবে:
```
Server running on port 4000
Webhook URL: http://localhost:4000/webhook
```

---

## Step 4: Cloudflare Tunnel দিয়ে Internet এ Expose করো

তোমার PC তে localhost চলছে, কিন্তু WhatsApp কে public URL লাগবে। Cloudflare Tunnel ব্যবহার করো:

```bash
npx cloudflared tunnel --url http://localhost:4000
```

Terminal এ একটা URL পাবে, যেমন:
```
https://something-random.trycloudflare.com
```

> এই URL টা copy করে রাখো - পরের step এ লাগবে।

---

## Step 5: Meta Dashboard এ Webhook Set করো

1. https://developers.facebook.com এ যাও
2. তোমার WhatsApp Business App এ ঢোকো
3. বাম পাশে **WhatsApp > Configuration** এ যাও
4. **Webhook** section এ:
   - **Callback URL:** `https://something-random.trycloudflare.com/webhook`
     (Step 4 এ যে URL পেয়েছো সেটা + `/webhook`)
   - **Verify Token:** `my_secret_verify_token_123`
     (তোমার `.env` এর `VERIFY_TOKEN` এর value)
5. **Verify and Save** click করো
6. **Webhook fields** এ `messages` subscribe করো

---

## Step 6: Test করো!

তোমার WhatsApp Business number এ message পাঠাও:

| Command | কী হবে |
|---------|--------|
| `hi` | Greeting message পাবে |
| `products` | Product list দেখাবে |
| `add 1` | Cart এ product add হবে |
| `cart` | Cart দেখাবে |
| `order` | Order confirm হবে |
| যেকোনো প্রশ্ন | AI reply দিবে |

---

## সমস্যা হলে যা Check করবে

| সমস্যা | সমাধান |
|---------|--------|
| Server start হচ্ছে না | `npm install` আবার করো, Node.js version check করো |
| Webhook verify হচ্ছে না | `.env` এর `VERIFY_TOKEN` আর Meta Dashboard এ same value দিয়েছো কিনা check করো |
| Message reply আসছে না | Cloudflare Tunnel চালু আছে কিনা check করো, Meta Dashboard এ `messages` subscribe করেছো কিনা দেখো |
| AI reply দিচ্ছে না | `.env` এ `GROQ_API_KEY` বা `GEMINI_API_KEY` সঠিক আছে কিনা check করো |
| Admin notification আসছে না | `.env` এ `ADMIN_NUMBER` সেট করেছো কিনা দেখো |

---

## 24/7 চালাতে চাইলে (Optional)

PC বন্ধ করলে bot ও বন্ধ হয়ে যাবে। সবসময় চালু রাখতে **Render.com** এ deploy করো:

1. GitHub এ code push করো
2. https://render.com এ গিয়ে **New Web Service** create করো
3. GitHub repo connect করো
4. Environment variables (`.env` এর সব values) সেট করো
5. Deploy করো - ব্যাস, 24/7 চলবে!
