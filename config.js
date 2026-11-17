// config.js
// All bot settings live here. Change values here only.
module.exports = {
  // Delete any message that contains a link.
  deleteLinks: true,

  // Remove the sender from the group after a link message.
  removeLinkSenders: true,

  // Admins are never punished for posting links.
  exemptAdmins: true,

  // Delete view-once media as soon as it arrives.
  deleteViewOnce: true,

  // Send a periodic welcome message to each group.
  periodicWelcome: true,
  // Interval in milliseconds. 60000 means one minute.
  periodicWelcomeIntervalMs: 60000,
  periodicWelcomeText:
    "Welcome to the group! Please be respectful. ഗ്രൂപ്പിലേക്ക് സ്വാഗതം! എല്ലാവരും മാന്യമായി പെരുമാറുക.",

  // Welcome new members the moment they join.
  welcomeOnJoin: true,

  // AI chat settings.
  aiReplies: true,
  // true means reply to every message, false means only when the bot is mentioned.
  replyToEveryMessage: true,
  // Minimum seconds between two AI replies in one group.
  aiCooldownSeconds: 5,
};
