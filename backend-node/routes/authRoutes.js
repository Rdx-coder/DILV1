const express = require('express');
const router = express.Router();
const { login, getMe, initializeAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/init', initializeAdmin);
router.get('/me', protect, getMe);

module.exports = router;