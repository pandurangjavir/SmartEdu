const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  studentProfile,
  studentAttendance,
  studentMarks,
  studentFees,
  studentEvents,
  studentNotifications,
} = require('../controllers/rbacController');

const router = express.Router();

router.use(verifyJwt, requireRole(['student']));

router.get('/profile/:id', studentProfile);
router.get('/attendance/:branch/:year/:id', studentAttendance);
router.get('/marks/:branch/:year/:id', studentMarks);
router.get('/fees/:branch/:year/:id', studentFees);
router.get('/events/:branch', studentEvents);
router.get('/notifications/:branch', studentNotifications);

module.exports = router;
