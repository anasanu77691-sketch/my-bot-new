require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const config = require("./config");
const { containsLink } = require("./linkDetector");
const { getAiReply } = require("./aiReply");

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

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

