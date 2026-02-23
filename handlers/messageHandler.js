const { getAIReply } = require("../services/ai");
const store = require("../services/store");
const { sendMessage } = require("../services/whatsapp");
const db = require("../services/database");

const ADMIN_NUMBER = process.env.ADMIN_NUMBER;

// Helper: check if text exactly matches or is one of the words
function matchesExact(text, keywords) {
  return keywords.includes(text);
}

// Helper: check if any keyword is a whole word in the text
function containsWord(text, keywords) {
  const words = text.split(/\s+/);
  return keywords.some((kw) => words.includes(kw));
}

/**
 * Handle incoming WhatsApp messages and return a reply
 */
async function handleMessage(message, senderName) {
  const type = message.type;
  const userId = message.from;

  // Track user in database
  db.upsertUser(userId, senderName);

  if (type === "text") {
    const text = message.text.body.trim();
    return await handleTextMessage(text, userId, senderName);
  }

  if (type === "interactive") {
    const buttonTitle = message.interactive?.button_reply?.title;
    return `You selected: ${buttonTitle}`;
  }

  if (type === "image") {
    return "Thanks for the image! I received it.";
  }

  if (type === "audio") {
    return (
      `Voice message peye gechi!\n\n` +
      `Ekhon voice process korte pari na, please text e likhun.\n` +
      `Bangla, English, Banglish - jeta comfortable!\n\n` +
      `Type *help* to see commands.`
    );
  }

  if (type === "location") {
    return "Thanks for sharing your location! We can deliver to your area.";
  }

  if (type === "sticker") {
    return "Nice sticker! Type *help* to see what I can do.";
  }

  return "Sorry, I can only process text messages right now. Type *help* for commands.";
}

/**
 * Handle text messages - commands + AI fallback
 */
async function handleTextMessage(text, userId, senderName) {
  const lowerText = text.toLowerCase().trim();

  // === EXACT MATCH COMMANDS (highest priority) ===

  // Greetings - exact match only (fixes "history" matching "hi")
  if (
    matchesExact(lowerText, [
      "hi",
      "hello",
      "hey",
      "assalamualaikum",
      "salam",
      "hola",
    ]) ||
    lowerText.startsWith("হাই") ||
    lowerText.startsWith("হ্যালো") ||
    lowerText.startsWith("আসসালামু")
  ) {
    return (
      `Hello ${senderName}! Welcome to *ShopBot*\n\n` +
      `I can help you with:\n\n` +
      `*Shopping:*\n` +
      `- *products* - Browse our store\n` +
      `- *cart* - View your cart\n` +
      `- *order* - Place order\n` +
      `- *my orders* - Order history\n\n` +
      `*AI Chat:*\n` +
      `- Just type anything! I understand Bangla, English, Banglish\n\n` +
      `*Other:*\n` +
      `- *help* - All commands\n` +
      `- *time* - Current time`
    );
  }

  // Help - exact match
  if (matchesExact(lowerText, ["help", "menu", "হেল্প"])) {
    return (
      `*All Commands:*\n\n` +
      `*Shopping:*\n` +
      `- *products* - See all products\n` +
      `- *details [id]* - Product details\n` +
      `- *add [id]* - Add to cart\n` +
      `- *remove [id]* - Remove from cart\n` +
      `- *cart* - View cart\n` +
      `- *clear cart* - Empty cart\n` +
      `- *order* - Place order\n` +
      `- *my orders* - Order history\n\n` +
      `*AI Chat:*\n` +
      `- Just type any question in Bangla/English!\n\n` +
      `*Other:*\n` +
      `- *hi* - Greeting\n` +
      `- *time* - Bangladesh time\n` +
      `- *help* - This menu`
    );
  }

  // === E-COMMERCE COMMANDS ===

  // Clear cart (check before "cart" to avoid conflict)
  if (
    lowerText === "clear cart" ||
    lowerText === "empty cart" ||
    lowerText === "delete cart"
  ) {
    return store.clearCart(userId);
  }

  // My orders (check before "order" to avoid conflict)
  if (
    lowerText === "my orders" ||
    lowerText === "my order" ||
    lowerText === "order history"
  ) {
    return store.getMyOrders(userId);
  }

  // Product list - word match
  if (
    matchesExact(lowerText, ["products", "product", "shop", "store"]) ||
    containsWord(lowerText, ["product", "products", "item", "items", "পণ্য", "প্রোডাক্ট"])
  ) {
    return store.getProductList();
  }

  // Product details
  if (lowerText.startsWith("details ") || lowerText.startsWith("detail ")) {
    const id = parseInt(lowerText.split(" ")[1]);
    if (isNaN(id)) return "Use: *details [number]*\nExample: details 1";
    return store.getProductDetails(id);
  }

  // Add to cart
  if (lowerText.startsWith("add ")) {
    const parts = lowerText.split(" ");
    const id = parseInt(parts[1]);
    const qty = parseInt(parts[2]) || 1;
    if (isNaN(id)) return "Use: *add [product id]*\nExample: add 1";
    if (qty < 1 || qty > 99) return "Quantity 1-99 er moddhe hote hobe.";
    return store.addToCart(userId, id, qty);
  }

  // Remove from cart
  if (lowerText.startsWith("remove ")) {
    const id = parseInt(lowerText.split(" ")[1]);
    if (isNaN(id)) return "Use: *remove [product id]*\nExample: remove 1";
    return store.removeFromCart(userId, id);
  }

  // View cart - exact match
  if (matchesExact(lowerText, ["cart", "কার্ট", "bag"])) {
    return store.viewCart(userId);
  }

  // Place order - exact match
  if (matchesExact(lowerText, ["order", "checkout", "buy", "অর্ডার"])) {
    const result = store.placeOrder(userId, senderName);

    if (typeof result === "string") return result;

    // Admin notification (non-blocking)
    if (ADMIN_NUMBER) {
      const adminMsg =
        `*New Order Received!*\n\n` +
        `Order ID: *${result.orderId}*\n` +
        `Customer: ${result.senderName}\n` +
        `Phone: ${result.userId}\n\n` +
        `*Items:*\n${result.itemsText}\n` +
        `*Total: ৳${result.total}*`;

      sendMessage(ADMIN_NUMBER, adminMsg).catch((err) =>
        console.error("Admin notification failed:", err.message)
      );
    }

    return result.reply;
  }

  // Time - exact match
  if (matchesExact(lowerText, ["time", "সময়", "টাইম"])) {
    const now = new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });
    return `Current time (BD): ${now}`;
  }

  // AI with prefix
  if (lowerText.startsWith("ai ")) {
    const question = text.slice(3).trim();
    if (!question) return "Write your question after *ai*\nExample: ai best phone?";
    return await getAIReply(userId, question);
  }

  // === DEFAULT: Send to AI ===
  return await getAIReply(userId, text);
}

module.exports = { handleMessage };
