const mongoose = require('mongoose');
const crypto = require('crypto');

const LicenseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: 1
  },
  metadata: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model('License', LicenseSchema);
