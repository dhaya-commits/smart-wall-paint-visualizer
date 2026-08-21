const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', auth, isAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard data would go here' });
});

module.exports = router;
