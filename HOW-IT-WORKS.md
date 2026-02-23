# WhatsApp Bot - সহজ ভাষায় পুরো ব্যাপারটা

একটু ভাবো - তুমি একটা দোকানে বসে আছো। একজন customer আসলো, কিছু জিজ্ঞেস করলো, তুমি answer দিলে। **তোমার bot ঠিক এই কাজটাই করে - কিন্তু WhatsApp এ, 24 ঘণ্টা, automatically।**

---

## ভিতরে কী হচ্ছে? (একদম সহজে)

কল্পনা করো একটা **রেস্টুরেন্ট:**

```
Customer (WhatsApp User)
    |
    |  "আমি বিরিয়ানি খাবো"
    ↓
Waiter (Meta/WhatsApp Server)
    |
    |  Customer এর কথা নিয়ে যায় kitchen এ
    ↓
Kitchen Door (index.js - তোমার server)
    |
    |  Order slip টা Manager কে দেয়
    ↓
Manager (messageHandler.js)
    |
    |  দেখে customer কী চায়:
    |
    ├── "menu দাও" → নিজেই menu card দিয়ে দেয় (instant)
    |
    ├── "বিরিয়ানি দাও" → Chef (store.js) কে বলে রান্না করতে
    |
    └── "আজকের special কী?" → AI Chef (ai.js) কে জিজ্ঞেস করে
              |
              ├── Groq AI (Head Chef - fast, বেশি skilled)
              └── Gemini AI (Backup Chef - Groq ব্যস্ত থাকলে)
    ↓
Reply তৈরি হলো
    ↓
Waiter (WhatsApp) customer কে reply পৌঁছে দেয়
```

---

## প্রতিটা ফাইল = একজন কর্মী

| ফাইল | কে সে? | কী করে? |
|---|---|---|
| **index.js** | **দোকানের দরজা** | Customer আসলে ভিতরে ঢোকায়, বের হওয়ার সময় reply দেয় |
| **messageHandler.js** | **Manager** | Customer কী চায় বুঝে সঠিক জায়গায় পাঠায় |
| **ai.js** | **AI Brain** | যেকোনো প্রশ্নের intelligent answer দেয় |
| **store.js** | **Shopkeeper** | Product দেখানো, cart, order - সব handle করে |
| **database.js** | **Notebook/Khata** | সব data লিখে রাখে - order, customer info |
| **whatsapp.js** | **Delivery Boy** | Reply নিয়ে WhatsApp এ পৌঁছে দেয় |
| **products.json** | **Product Shelf** | কোন product আছে, দাম কত |
| **.env** | **Secret Locker** | API keys, passwords - গোপন জিনিস রাখে |

---

## কিছু Real Examples - Step by Step

### Example 1: User "products" লিখলো

```
Step 1: User WhatsApp এ "products" লিখলো
         ↓
Step 2: WhatsApp এটা Meta server এ পাঠালো
         ↓
Step 3: Meta তোমার server (index.js) এ পাঠালো
         ↓
Step 4: index.js দেখলো - এটা text message
        messageHandler.js কে দিলো
         ↓
Step 5: messageHandler.js দেখলো "products" শব্দটা আছে
        store.js কে বললো "product list দাও"
         ↓
Step 6: store.js products.json থেকে সব product পড়লো
        সুন্দর করে list বানালো
         ↓
Step 7: whatsapp.js এই list Meta API দিয়ে পাঠালো
         ↓
Step 8: User WhatsApp এ product list দেখতে পেলো!
```

### Example 2: AI Chat - "ভালো ফোন কোনটা?"

```
User: "ভালো ফোন কোনটা কিনবো?"
         ↓
messageHandler.js: "এটা কোনো command না, AI কে দিই"
         ↓
ai.js: "আগে Groq AI কে জিজ্ঞেস করি..."
         ↓
Groq AI (Llama 3.3): "আপনার বাজেট কত? 20k এর
মধ্যে Samsung A55 বা Xiaomi 14C ভালো..."
         ↓
User WhatsApp এ intelligent reply পায়!
```

AI এর **memory ও আছে** - মানে তুমি যদি বলো "20k budget", পরে বলো "আর কোনটা?" - AI মনে রাখবে তুমি আগে budget বলেছিলে!

### Example 3: Order দিলে কী হয়?

```
User: "add 1"     → Cart এ Earbuds add হলো (database এ save)
User: "add 3"     → Cart এ T-shirt add হলো (database এ save)
User: "cart"      → Cart দেখালো: Earbuds ৳850 + T-shirt ৳450 = ৳1300
User: "order"     → Order confirm!
                      ↓
               2টা কাজ হয় simultaneously:
               ├── User কে বলে: "Order ORD-ABC123 confirmed!"
               └── Admin (তুমি) কে WhatsApp notification যায়:
                   "নতুন order এসেছে! ORD-ABC123, ৳1300"
```

Server restart হলেও order data থাকবে (SQLite database এ save)!

---

## Internet এ কিভাবে Connected?

```
তোমার PC (localhost:4000)
    ↑
    | Cloudflare Tunnel (সুড়ঙ্গ)
    ↓
Public URL (trycloudflare.com)
    ↑
    | Meta webhook
    ↓
WhatsApp Users
```

**Cloudflare Tunnel** = একটা সুড়ঙ্গ যেটা তোমার PC কে internet এ দেখায়। এটা না থাকলে বাইরে থেকে কেউ তোমার PC তে আসতে পারবে না।

**24/7 Running করতে** Render.com এ deploy করলে PC ই লাগবে না - cloud এ চলবে!

---

## AI System কিভাবে কাজ করে?

```
User message আসলো
    ↓
ai.js check করে:
    ↓
Groq API Key আছে?
    ├── হ্যাঁ → Groq AI (Llama 3.3 70B) ব্যবহার করে
    |           - Super fast reply
    |           - Bangla অনেক ভালো বোঝে
    |           - Chat memory আছে (আগের কথা মনে রাখে)
    |           - FREE: 14,400 requests/day
    |
    └── না / fail → Gemini AI try করে
                      - Google এর AI
                      - ভালো quality
                      - FREE: 1,500 requests/day
                      |
                      └── এটাও fail → User কে commands
                                       ব্যবহার করতে বলে
```

দুটো AI ই **FREE**। Groq আগে try করে কারণ faster আর Bangla better বোঝে।

---

## Database কিভাবে কাজ করে?

আগে সব data RAM (memory) তে ছিলো - server বন্ধ হলেই সব মুছে যেতো।
এখন **SQLite database** ব্যবহার করছি - একটা file এ সব save হয়।

```
data/bot.db (SQLite Database)
    |
    ├── users table
    |   - কে কে bot ব্যবহার করেছে
    |   - নাম, phone number, কবে first visit
    |   - কতটা order দিয়েছে
    |
    ├── cart_items table
    |   - কার cart এ কী আছে
    |   - server restart হলেও cart থাকবে
    |
    └── orders table
        - সব order এর record
        - Order ID, items, total, status
        - Order history দেখা যায়
```

---

## Admin Notification কিভাবে কাজ করে?

```
Customer order দিলো
    ↓
Bot customer কে confirm message দিলো
    ↓
Same সময়ে Admin (তোমার) WhatsApp এ notification যায়:

"*নতুন Order!*
Order ID: ORD-ABC123
Customer: Rahim
Phone: 8801XXXXXXXXX
Items: Earbuds x2 = ৳1700
Total: ৳1700"
```

`.env` ফাইলে `ADMIN_NUMBER=তোমার_number` দিলেই কাজ করবে।

---

## সংক্ষেপে পুরো System

```
WhatsApp User
    ↕ (message আসা-যাওয়া)
Meta WhatsApp Cloud API (FREE)
    ↕ (webhook)
Cloudflare Tunnel (FREE) / Render.com (FREE)
    ↕
তোমার Node.js Server
    ├── Commands → Instant reply
    ├── Shopping → Database (SQLite)
    |               ├── Cart save
    |               ├── Order save
    |               └── User tracking
    ├── AI Chat → Groq AI (FREE) / Gemini AI (FREE)
    |               ├── Bangla/English/Banglish বোঝে
    |               └── Chat memory আছে
    └── Admin → Order notification WhatsApp এ
```

**পুরো project 100% FREE!** কোনো টাকা লাগে না।

---

## Project Files Summary

```
chatBot/
├── index.js                    # দোকানের দরজা - server চালায়
├── handlers/
│   └── messageHandler.js       # Manager - কোন reply দিবে decide করে
├── services/
│   ├── ai.js                   # AI Brain - Groq + Gemini handle করে
│   ├── gemini.js               # Gemini AI (standalone backup)
│   ├── whatsapp.js             # Delivery Boy - WhatsApp এ reply পাঠায়
│   ├── store.js                # Shopkeeper - product, cart, order
│   └── database.js             # Notebook - SQLite database manage করে
├── data/
│   ├── products.json           # Product list
│   └── bot.db                  # Database file (auto তৈরি হয়)
├── .env                        # Secret keys
├── .gitignore
├── package.json
├── README.md                   # Setup guide
└── HOW-IT-WORKS.md             # এই file - কিভাবে কাজ করে
```