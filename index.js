// index.js
// Main file: connects to WhatsApp and runs bot
require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const config = require("./config");
const { containsLink } = require("./linkDetector");
const { getAiReply } = require("./aiReply");

// Create the WhatsApp client. LocalAuth saves session data
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Listen for pairing code instead of QR
client.on("code", (code) => {
  console.log("Pairing code: ", code);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  const chat = await msg.getChat();
  if (chat.isGroup) {
    if (await containsLink(msg.body)) {
      await msg.reply("links are not allowed");
    } else {
      const reply = await getAiReply(msg.body);
      if (reply) {
        await msg.reply(reply);
      }
    }
  }
});

client.initialize();

