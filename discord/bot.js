const { Client, Intents, WebhookClient } = require('discord.js');
const config = require('../config/config');

let client = null;
let webhook = null;

module.exports.setupDiscordBot = () => {
  // Skip bot setup if credentials are missing
  if (!config.discord.clientId || !config.discord.clientSecret) {
    console.warn('Discord bot credentials missing - skipping bot initialization');
    return;
  }

  try {
    // Initialize Discord webhook if URL is provided
    if (config.discord.webhook) {
      webhook = new WebhookClient({ url: config.discord.webhook });
      console.log('Discord webhook initialized');
    }
  } catch (error) {
    console.error('Error initializing Discord webhook:', error);
  }
};

// Send notification to Discord webhook
module.exports.sendWebhookMessage = async (message, options = {}) => {
  if (!webhook) return;
  
  try {
    await webhook.send({
      content: message,
      username: options.username || config.server.name,
      avatarURL: options.avatarURL,
      embeds: options.embeds
    });
  } catch (error) {
    console.error('Error sending webhook message:', error);
  }
};
