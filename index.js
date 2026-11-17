// index.js
// Main file: connects to WhatsApp and runs all moderation and chat features.
require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const config = require("./config");
const { containsLink } = require("./linkDetector");
const { getAiReply } = require("./aiReply");

// Create the WhatsApp client. LocalAuth saves the login so you scan the QR only once.
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  },
});

// Remembers the last AI reply time for each group.
const lastReplyTime = {};

// Show the QR code in the logs so you can scan it with the bot phone.
client.on("qr", (qr) => {
  console.log("Scan this QR code with the bot's WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Bot is ready.");
  startPeriodicWelcome();
});

// Check whether a person is an admin of the given group chat.
function isAdmin(chat, userId) {
  const participant = chat.participants.find(
    (p) => p.id._serialized === userId
  );
  return participant ? participant.isAdmin || participant.isSuperAdmin : false;
}

// Handle every incoming group message.
client.on("message", async (msg) => {
  try {
    const chat = await msg.getChat();
    if (!chat.isGroup) return;

    const senderId = msg.author || msg.from;
    const senderIsAdmin = isAdmin(chat, senderId);

    // 1. Delete view-once messages immediately.
    if (config.deleteViewOnce && msg.isViewOnce) {
      await msg.delete(true);
      return;
    }

    // 2. Delete link messages and remove the sender.
    if (config.deleteLinks && containsLink(msg.body)) {
      if (config.exemptAdmins && senderIsAdmin) return;
      await msg.delete(true);
      if (config.removeLinkSenders) {
        await chat.removeParticipants([senderId]);
      }
      return;
    }

    // 3. AI chat reply.
    if (!config.aiReplies || !msg.body || msg.fromMe) return;

    if (!config.replyToEveryMessage) {
      const mentions = await msg.getMentions();
      const botId = client.info.wid._serialized;
      const mentioned = mentions.some((c) => c.id._serialized === botId);
      if (!mentioned) return;
    }

    // Cooldown so the bot does not flood the group.
    const now = Date.now();
    const last = lastReplyTime[chat.id._serialized] || 0;
    if (now - last < config.aiCooldownSeconds * 1000) return;
    lastReplyTime[chat.id._serialized] = now;

    const contact = await msg.getContact();
    const name = contact.pushname || "Someone";
    const reply = await getAiReply(name, msg.body);
    if (reply) await msg.reply(reply);
  } catch (error) {
    console.error("Message handler error:", error.message);
  }
});

// Welcome new members the moment they join.
client.on("group_join", async (notification) => {
  if (!config.welcomeOnJoin) return;
  try {
    const chat = await notification.getChat();
    await chat.sendMessage(config.periodicWelcomeText);
  } catch (error) {
    console.error("Join welcome error:", error.message);
  }
});

// Send the welcome message to every group on a timer.
function startPeriodicWelcome() {
  if (!config.periodicWelcome) return;
  setInterval(async () => {
    try {
      const chats = await client.getChats();
      for (const chat of chats) {
        if (chat.isGroup) await chat.sendMessage(config.periodicWelcomeText);
      }
    } catch (error) {
      console.error("Periodic welcome error:", error.message);
    }
  }, config.periodicWelcomeIntervalMs);
}

client.initialize();
