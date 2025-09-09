const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
	hodListTeachers,
	hodListStudents,
	hodListAttendance,
	hodListMarks,
	hodListFees,
	hodAttendanceDefaulters,
	hodFeesDefaulters,
	hodListEvents,
	hodListNotifications,
} = require('../controllers/rbacController');

const router = express.Router();

router.use(verifyJwt, requireRole(['hod']));

router.get('/teachers/:branch', hodListTeachers);
router.get('/students/:branch/:year', hodListStudents);
router.get('/attendance/:branch/:year', hodListAttendance);
router.get('/marks/:branch/:year', hodListMarks);
router.get('/fees/:branch/:year', hodListFees);
router.get('/attendance-defaulters/:branch/:year', hodAttendanceDefaulters);
router.get('/fees-defaulters/:branch/:year', hodFeesDefaulters);
router.get('/events/:branch', hodListEvents);
router.get('/notifications/:branch', hodListNotifications);

module.exports = router;
