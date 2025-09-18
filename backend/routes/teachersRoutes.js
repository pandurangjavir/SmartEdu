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
const { ensureTeacherBranchAccess } = require('../middleware/branchMiddleware');

router.get('/profile/:id', teacherProfile);
router.get('/classes/:branch/:year', ensureTeacherBranchAccess, teacherClasses);
router.get('/attendance/:branch/:year/:subject', ensureTeacherBranchAccess, teacherAttendanceBySubject);
router.get('/marks/:branch/:year/:subject', ensureTeacherBranchAccess, teacherMarksBySubject);
router.get('/fees/:branch/:year', ensureTeacherBranchAccess, teacherFeesByYear);
router.get('/events/:branch', ensureTeacherBranchAccess, teacherEvents);
router.get('/notifications/:branch', ensureTeacherBranchAccess, teacherNotifications);

module.exports = router;
