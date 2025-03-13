const { isAdmin: checkDiscordAdmin } = require('../discord/bot');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/discord');
};

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/discord');
  }
  
  // Check if user is an admin in database
  if (req.user.isAdmin) {
    return next();
  }
  
  // If not in database, check Discord roles
  const hasAdminRole = await checkDiscordAdmin(req.user.discordId);
  if (hasAdminRole) {
    // Update user in database
    req.user.isAdmin = true;
    await req.user.save();
    return next();
  }
  
  res.status(403).render('error', { 
    message: 'Access denied. You need administrator privileges.' 
  });
};

module.exports = { isAuthenticated, isAdmin };
