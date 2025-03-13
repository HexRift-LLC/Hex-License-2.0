const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const License = require('../models/License');
const User = require('../models/User');

// Middleware to check if user is authenticated and an admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).render('error', { 
    message: 'Access denied. Admin privileges required.', 
    title: 'Access Denied' 
  });
};

// Admin dashboard
router.get('/', isAdmin, async (req, res) => {
  try {
    // Get counts for dashboard stats
    const userCount = await User.countDocuments();
    const licenseCount = await License.countDocuments();
    const productCount = await Product.countDocuments();
    
    // Get recent licenses
    const recentLicenses = await License.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product')
      .populate('user');
    
    res.render('admin/index', { 
      title: 'Admin Dashboard',
      stats: {
        totalUsers: userCount,
        totalLicenses: licenseCount,
        totalProducts: productCount
      },
      recentLicenses
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { 
      message: 'Error loading admin dashboard', 
      title: 'Error' 
    });
  }
});

// Products management
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render('admin/products', { title: 'Manage Products', products });
  } catch (error) {
    console.error('Product management error:', error);
    res.status(500).render('error', { 
      message: 'Error loading products', 
      title: 'Error' 
    });
  }
});

// Licenses management
router.get('/licenses', isAdmin, async (req, res) => {
  try {
    const licenses = await License.find()
      .sort({ createdAt: -1 })
      .populate('product')
      .populate('user');
    res.render('admin/licenses', { title: 'Manage Licenses', licenses });
  } catch (error) {
    console.error('License management error:', error);
    res.status(500).render('error', { 
      message: 'Error loading licenses', 
      title: 'Error' 
    });
  }
});
router.get('/licenses/generate', isAdmin, async (req, res) => {
  try {
    // Get products for the dropdown
    const products = await Product.find({ active: true });
    
    res.render('admin/generate-licenses', { 
      title: 'Generate Licenses',
      products
    });
  } catch (error) {
    console.error('Error loading license generation page:', error);
    res.status(500).render('error', { 
      message: 'Failed to load license generation page', 
      title: 'Error' 
    });
  }
});

// Users management page
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.render('admin/users', { 
      title: 'Manage Users',
      users
    });
  } catch (error) {
    console.error('Error loading users page:', error);
    res.status(500).render('error', { 
      message: 'Failed to load users management page', 
      title: 'Error' 
    });
  }
});

// Other admin routes go here

module.exports = router;