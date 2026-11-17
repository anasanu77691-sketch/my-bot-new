// aiReply.js
// Generates chat replies using the Claude API.
require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-5";

// Tells Claude how to behave inside the group.
const SYSTEM_PROMPT =
  "You are a friendly member of a WhatsApp group chat. " +
  "Chat casually like a normal person, in short messages of one or two sentences. " +
  "Detect the language of the user's message. " +
  "If it is Malayalam, reply in Malayalam. " +
  "If it is English, reply in English. " +
  "If it is Manglish (Malayalam written in English letters), reply in Malayalam script. " +
  "Answer questions helpfully and keep a warm, light tone.";

async function getAiReply(userName, messageText) {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userName + " says: " + messageText },
      ],
    });
    return response.content[0].text.trim();
  } catch (error) {
    console.error("AI reply failed:", error.message);
    return null;
  }
}

module.exports = { getAiReply };
