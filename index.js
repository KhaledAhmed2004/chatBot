require("dotenv").config();
const express = require("express");
const { handleMessage } = require("./handlers/messageHandler");
const { sendMessage } = require("./services/whatsapp");
const db = require("./services/database");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Webhook verification (Meta sends a GET request to verify)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    return res.status(200).send(challenge);
  }

  console.log("Webhook verification failed.");
  res.sendStatus(403);
});

// Receive messages (Meta sends a POST request with message data)
app.post("/webhook", async (req, res) => {
  // Always respond 200 quickly to avoid timeouts
  res.sendStatus(200);

  try {
    const body = req.body;

    if (
      body.object === "whatsapp_business_account" &&
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // sender phone number
      const senderName =
        body.entry[0].changes[0].value.contacts?.[0]?.profile?.name ||
        "Unknown";

      console.log(`Message from ${senderName} (${from}): ${message.type}`);

      // Handle the message and get a reply (now async for AI)
      const reply = await handleMessage(message, senderName);

      if (reply) {
        await sendMessage(from, reply);
      }
    }
  } catch (error) {
    console.error("Error processing message:", error.message);
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("WhatsApp Bot is running!");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});

// Graceful shutdown - database connection close kore exit
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
