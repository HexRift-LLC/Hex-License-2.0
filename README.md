# Hex-License-2.0

Advanced license management system with Discord integration for software products.

## Features

- Discord authentication and role-based permissions
- Admin dashboard for license generation and management
- Generate single or bulk license keys
- Assign licenses to specific users
- Set expiration dates and usage limits for licenses
- API endpoint for license validation
- Discord webhook notifications

## Installation

### Prerequisites

- Node.js 14.x or higher
- MongoDB 4.x or higher
- Discord application for authentication

### Setup Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/hex-license-2.0.git
cd hex-license-2.0
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
# Server configuration
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hexlicense
SESSION_SECRET=your_random_session_secret

# Discord configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_ADMIN_ROLE_ID=your_admin_role_id

# Discord webhook for notifications
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Application settings
SERVER_URL=http://localhost:3000
SERVER_NAME=Hex License
```

4. Create a Discord application:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application and note the Client ID and Client Secret
   - Add a redirect URI: `http://localhost:3000/auth/discord/callback`
   - Create a bot for your application and add it to your server with proper permissions

5. Create a Discord webhook for notifications:
   - In your Discord server, go to a channel's settings
   - Select "Integrations" > "Webhooks" > "Create Webhook"
   - Copy the webhook URL and add it to your `.env` file

6. Start the application
```bash
npm start
```

## API Usage

### Validate License

To validate a license in your application, make a POST request to the following endpoint:

```
POST /api/validate
```

Request body:
```json
{
  "licenseKey": "your-license-key",
  "productId": "optional-product-id" 
}
```

Success response:
```json
{
  "valid": true,
  "license": {
    "product": "Product Name",
    "features": ["Feature 1", "Feature 2"],
    "expiresAt": "2023-12-31T23:59:59.999Z",
    "usageCount": 1,
    "maxUsage": 5
  }
}
```

Error response:
```json
{
  "valid": false,
  "message": "Error message"
}
```

## Usage Examples

### Node.js Implementation

```javascript
const axios = require('axios');

async function validateLicense(licenseKey) {
  try {
    const response = await axios.post('http://your-server.com/api/validate', {
      licenseKey
    });
    
    if (response.data.valid) {
      console.log('License is valid!');
      return response.data.license;
    } else {
      console.error('License validation failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Error validating license:', error.message);
    return null;
  }
}
```

### Python Implementation

```python
import requests

def validate_license(license_key):
    try:
        response = requests.post(
            'http://your-server.com/api/validate',
            json={'licenseKey': license_key}
        )
        
        data = response.json()
        
        if data.get('valid'):
            print('License is valid!')
            return data.get('license')
        else:
            print(f"License validation failed: {data.get('message')}")
            return None
    except Exception as e:
        print(f"Error validating license: {str(e)}")
        return None
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

## Configuration File

Let's create a configuration file:

```javascript:config/config.js
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
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    guildId: process.env.DISCORD_GUILD_ID,
    adminRoleId: process.env.DISCORD_ADMIN_ROLE_ID,
    webhook: process.env.DISCORD_WEBHOOK_URL,
  },
};

module.exports = config;
```

## App.js Entry Point

Finally, let's create the main app.js entry point:

```javascript:app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const config = require('./config/config');
const { setupDiscordStrategy } = require('./discord/auth');
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
```

## Starting the Application

To start the application, users can run:

```bash
node app.js
```

Or for development with auto-reload:

```bash
npm install -g nodemon
nodemon app.js
