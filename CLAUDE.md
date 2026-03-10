# Project: ShopBot — WhatsApp Chatbot + Web Store

## Project Structure

```
chatBot/
├── backend/                         ← Node.js + Express server
│   ├── src/
│   │   ├── bot/                     ← WhatsApp chatbot
│   │   │   ├── messageHandler.js    ← Message routing + command handling
│   │   │   └── whatsapp.js          ← Meta WhatsApp Cloud API wrapper
│   │   ├── api/                     ← Web store REST API
│   │   │   └── routes.js            ← All /api/* endpoints (products, cart, orders)
│   │   └── services/                ← Shared services
│   │       ├── ai.js                ← Groq + Gemini AI (bot only)
│   │       ├── database.js          ← SQLite DB (bot + API both use)
│   │       └── store.js             ← WhatsApp-formatted store logic (bot only)
│   ├── data/
│   │   └── products.json            ← Product catalog
│   ├── index.js                     ← Express entry point (/webhook + /api)
│   ├── package.json                 ← Backend deps: express, better-sqlite3, dotenv, axios, @google/generative-ai
│   └── .env                         ← API keys (WHATSAPP_TOKEN, GROQ_API_KEY, GEMINI_API_KEY, etc.)
│
├── frontend/                        ← Next.js 15 (App Router)
│   ├── app/
│   │   ├── layout.jsx               ← Root layout (server component, metadata)
│   │   ├── page.jsx                 ← Landing page (/)
│   │   ├── globals.css              ← All styles (WhatsApp green theme, CSS variables)
│   │   ├── store/page.jsx           ← Product listing (/store)
│   │   ├── product/[id]/page.jsx    ← Product detail (/product/:id)
│   │   ├── checkout/page.jsx        ← Checkout form + success (/checkout)
│   │   └── orders/page.jsx          ← Order tracking (/orders)
│   ├── components/
│   │   ├── ClientProviders.jsx      ← Client wrapper (CartProvider + Navbar + Footer + CartDrawer)
│   │   ├── Navbar.jsx               ← Top navigation (landing vs store variants)
│   │   ├── Footer.jsx               ← Footer
│   │   ├── CartDrawer.jsx           ← Right-side cart drawer
│   │   ├── ProductCard.jsx          ← Product grid card
│   │   └── CategoryFilter.jsx       ← Horizontal category pills
│   ├── context/
│   │   └── CartContext.jsx           ← Cart state management (useCart hook, session-based)
│   ├── lib/
│   │   └── api.js                   ← Backend API fetch wrappers
│   ├── next.config.mjs              ← API rewrites: /api/* → localhost:3000
│   └── package.json                 ← Frontend deps: next, react, react-dom
│
├── package.json                     ← Root convenience scripts (npm run dev, frontend:dev, setup)
├── .gitignore
└── CLAUDE.md                        ← This file
```

## How to Run

```bash
# Install all deps
npm run setup

# Terminal 1 — Backend (port 3000)
npm run dev

# Terminal 2 — Frontend (port 5173)
npm run frontend:dev
```

## Key Patterns

- **Backend**: CommonJS (`require`), Express 5, SQLite (better-sqlite3)
- **Frontend**: ES Modules, Next.js App Router, React 19, "use client" for interactive components
- **Cart**: Session-based (UUID in localStorage), server-side storage in SQLite
- **API proxy**: Frontend dev server rewrites `/api/*` to backend `localhost:3000`
- **Language**: Bengali + English + Banglish throughout UI and bot responses
- **Styling**: Plain CSS with CSS custom properties (no Tailwind), WhatsApp green (#25D366) theme

## Data Flow

- **Web Store**: Browser → Next.js → `/api/*` (proxy) → Express routes.js → SQLite
- **WhatsApp Bot**: User message → Meta webhook → `/webhook` POST → messageHandler.js → ai.js/store.js → whatsapp.js → Meta API → User
- **Shared DB**: Both web store and bot read/write same SQLite tables (orders, cart_items, stock, users)
