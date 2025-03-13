const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: String,
  email: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  accessToken: String,
  refreshToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
