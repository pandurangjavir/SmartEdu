const express = require('express');
const { testConnection, login, getProfile } = require('../controllers/authController');
const { verifyJwt } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/test', testConnection);
router.post('/login', login);
router.get('/me', verifyJwt, getProfile);
router.get('/profile', verifyJwt, getProfile); // Add profile endpoint for frontend compatibility

module.exports = router;
