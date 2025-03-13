const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');
const config = require('./config');

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Setup Discord authentication strategy
module.exports.setupDiscordStrategy = () => {
  // Make sure we have the required Discord configuration
  if (!config.discord.clientId || !config.discord.clientSecret) {
    console.warn('Discord OAuth credentials are missing! Authentication will not work.');
    return;
  }

  passport.use(new DiscordStrategy({
    clientID: config.discord.clientId,
    clientSecret: config.discord.clientSecret,
    callbackURL: config.discord.callbackURL,
    scope: ['identify', 'email', 'guilds']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      
      // Check if user exists in database
      let user = await User.findOne({ discordId: profile.id });
      
      // If not, create a new user
      if (!user) {
        user = new User({
          discordId: profile.id,
          username: profile.username,
          avatar: profile.avatar,
          email: profile.email,
          accessToken,
          refreshToken
        });
        
        // Check if this user should be an admin (based on Discord roles)
        // This is a safer way to check for guild membership and roles
        if (config.discord.adminRoleId && config.discord.guildId && profile.guilds) {
          const userGuild = profile.guilds.find(g => g.id === config.discord.guildId);
          
          // Check if the user has the admin role
          // The actual structure will depend on the Discord API response
          // For now, let's just log what we get and handle it safely
          if (userGuild) {
            console.log('User guild data:', userGuild);
            
            // Different Discord API versions might return roles in different formats
            // Let's check if the guild has permissions that indicate admin status
            if (userGuild.permissions && (userGuild.permissions & 0x8) === 0x8) {
              // 0x8 is the ADMINISTRATOR permission bit
              user.isAdmin = true;
              console.log('User granted admin privileges based on Discord permissions');
            }
            
            // If the API returns roles directly, check for admin role
            if (userGuild.roles && Array.isArray(userGuild.roles)) {
              if (userGuild.roles.includes(config.discord.adminRoleId)) {
                user.isAdmin = true;
                console.log('User granted admin privileges based on role ID');
              }
            }
          }
        }
        
        await user.save();
      } else {
        // Update existing user information
        user.username = profile.username;
        user.avatar = profile.avatar;
        user.email = profile.email;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Discord authentication error:', err);
      return done(err, null);
    }
  }));
};