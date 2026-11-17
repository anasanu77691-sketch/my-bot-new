// linkDetector.js
// Returns true when the text contains a link of any kind.
const LINK_REGEX = new RegExp(
  [
    "https?:\\/\\/\\S+",
    "www\\.\\S+",
    "chat\\.whatsapp\\.com\\/\\S+",
    "wa\\.me\\/\\S+",
    "t\\.me\\/\\S+",
    "\\b[a-z0-9-]+\\.(com|net|org|io|in|me|co|xyz|link|ly|app)\\b\\S*",
  ].join("|"),
  "i"
);

function containsLink(text) {
  if (!text) return false;
  return LINK_REGEX.test(text);
}

module.exports = { containsLink };
