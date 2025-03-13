const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// Dashboard index
router.get('/', isAuthenticated, async (req, res) => {
  try {
    res.render('dashboard/index', { 
      title: 'Dashboard',
      licenses: [] // You would fetch actual licenses here
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { 
      message: 'Error loading dashboard', 
      title: 'Error' 
    });
  }
});

module.exports = router;