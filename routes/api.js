const express = require('express');
const router = express.Router();
const License = require('../models/License');
const { logToDiscord } = require('../discord/bot');

// Validate license key
router.post('/validate', async (req, res) => {
  try {
    const { licenseKey, productId } = req.body;
    
    if (!licenseKey) {
      return res.status(400).json({ 
        valid: false, 
        message: 'License key is required' 
      });
    }
    
    // Find the license
    const license = await License.findOne({ key: licenseKey })
      .populate('product')
      .populate('user', 'username');
    
    if (!license) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid license key' 
      });
    }
    
    // Check if product ID matches if provided
    if (productId && license.product._id.toString() !== productId) {
      return res.status(400).json({ 
        valid: false, 
        message: 'License key is not valid for this product' 
      });
    }
    
    // Check if license is active
    if (!license.active) {
      return res.status(403).json({ 
        valid: false, 
        message: 'License key has been revoked' 
      });
    }
    
    // Check if license has expired
    if (license.expiresAt && new Date() > license.expiresAt) {
      return res.status(403).json({ 
        valid: false, 
        message: 'License key has expired' 
      });
    }
    
    // Check if license has exceeded max usage
    if (license.usageCount >= license.maxUsage) {
      return res.status(403).json({ 
        valid: false, 
        message: 'License key has reached maximum usage limit' 
      });
    }
    
    // Update usage count
    license.usageCount += 1;
    await license.save();
    
    // Log validation
    logToDiscord(`License key validated for ${license.product.name} by ${license.user ? license.user.username : 'Unknown user'}`, 'info');
    
    return res.json({
      valid: true,
      license: {
        product: license.product.name,
        features: license.product.features,
        expiresAt: license.expiresAt,
        usageCount: license.usageCount,
        maxUsage: license.maxUsage
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      valid: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
