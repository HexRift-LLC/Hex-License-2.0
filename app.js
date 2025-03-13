const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const config = require('./config/config');
const { setupDiscordStrategy } = require('./config/passport');
const { setupDiscordBot } = require('./discord/bot');

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    console.log('Connected to MongoDB');
    setupDiscordBot();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Configure view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session
app.use(session({
  secret: config.session.secret,
  resave: config.session.resave,
  saveUninitialized: config.session.saveUninitialized,
  store: MongoStore.create({
    mongoUrl: config.mongodb.uri,
    collectionName: 'sessions'
  }),
  cookie: config.session.cookie
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Setup Discord strategy (only if credentials are provided)
setupDiscordStrategy();

// Middleware to make user and config available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.config = config;
  res.locals.path = req.path;
  next();
});

// Setup routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Error handling
app.use((req, res, next) => {
  res.status(404).render('error', { 
    message: 'Page not found', 
    title: '404 Not Found' 
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { 
    message: 'Internal server error', 
    title: '500 Server Error' 
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});