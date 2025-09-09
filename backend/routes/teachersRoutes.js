const express = require('express');
const { verifyJwt, authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  teacherProfile,
  teacherClasses,
  teacherAttendanceBySubject,
  teacherMarksBySubject,
  teacherFeesByYear,
  teacherEvents,
  teacherNotifications,
} = require('../controllers/rbacController');

const router = express.Router();

router.use(verifyJwt, requireRole(['teacher']));

router.get('/profile/:id', teacherProfile);
router.get('/classes/:branch/:year', teacherClasses);
router.get('/attendance/:branch/:year/:subject', teacherAttendanceBySubject);
router.get('/marks/:branch/:year/:subject', teacherMarksBySubject);
router.get('/fees/:branch/:year', teacherFeesByYear);
router.get('/events/:branch', teacherEvents);
router.get('/notifications/:branch', teacherNotifications);

module.exports = router;
