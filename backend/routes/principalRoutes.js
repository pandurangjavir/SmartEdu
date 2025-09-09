const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  principalListHODs,
  principalListTeachers,
  principalListStudents,
  principalListAttendance,
  principalListMarks,
  principalListFees,
  principalListEvents,
  principalListNotifications,
} = require('../controllers/rbacController');

const router = express.Router();

router.use(verifyJwt, requireRole(['principal']));

router.get('/hods', principalListHODs);
router.get('/teachers', principalListTeachers);
router.get('/students', principalListStudents);
router.get('/attendance', principalListAttendance);
router.get('/marks', principalListMarks);
router.get('/fees', principalListFees);
router.get('/events', principalListEvents);
router.get('/notifications', principalListNotifications);

module.exports = router;


