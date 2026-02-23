const axios = require("axios");

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const API_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

/**
 * Send a text message via WhatsApp Cloud API
 */
async function sendMessage(to, text) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Message sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to send message:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Send an image message
 */
async function sendImage(to, imageUrl, caption = "") {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "image",
        image: { link: imageUrl, caption: caption },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to send image:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send interactive button message
 */
async function sendButtons(to, bodyText, buttons) {
  try {
    const response = await axios.post(
      BASE_URL,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons.map((btn, i) => ({
              type: "reply",
              reply: { id: `btn_${i}`, title: btn },
            })),
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to send buttons:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendMessage, sendImage, sendButtons };
