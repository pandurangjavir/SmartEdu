const express = require('express');
const { sendMessage } = require('../controllers/chatbotController');
const { verifyJwt } = require('../middleware/authMiddleware');

const router = express.Router();

// Chatbot endpoint to connect with Rasa
router.post('/', verifyJwt, sendMessage);

// Get chat history (placeholder - would need database storage)
router.get('/history', verifyJwt, (req, res) => {
  // For now, return empty history since we don't have persistent chat storage
  res.json({ 
    messages: [],
    success: true 
  });
});

// Voice endpoint (placeholder - would need speech-to-text integration)
router.post('/voice', verifyJwt, (req, res) => {
  res.status(501).json({ 
    msg: 'Voice processing not implemented yet',
    success: false 
  });
});

module.exports = router;
