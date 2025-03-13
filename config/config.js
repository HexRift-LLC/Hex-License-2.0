require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    url: process.env.SERVER_URL || 'http://localhost:3000',
    name: process.env.SERVER_NAME || 'Hex License',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hexlicense',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'hex_license_default_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
    guildId: process.env.DISCORD_GUILD_ID || '',
    adminRoleId: process.env.DISCORD_ADMIN_ROLE_ID || '',
    webhook: process.env.DISCORD_WEBHOOK_URL || '',
  },
};

// Log configuration on startup (excluding sensitive data)
console.log('Configuration loaded:');
console.log('- Server name:', config.server.name);
console.log('- Server port:', config.server.port);
console.log('- MongoDB URI:', config.mongodb.uri.split('@').length > 1 ? 
  `mongodb://${config.mongodb.uri.split('@')[1]}` : 'Using default connection string');
console.log('- Discord configured:', !!config.discord.clientId);

module.exports = config;