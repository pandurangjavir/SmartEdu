const express = require('express');
const { getAllUsers, getStats } = require('../controllers/adminController');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin routes - only accessible by admin/principal
router.get('/users', verifyJwt, requireRole(['admin', 'principal']), getAllUsers);
router.get('/stats', verifyJwt, requireRole(['admin', 'principal']), getStats);

module.exports = router;
