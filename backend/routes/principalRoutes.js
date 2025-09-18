const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  principalListHODs,
  principalGetHOD,
  principalListTeachers,
  principalListTeachersByBranch,
  principalGetTeacher,
  principalListStudents,
  principalListStudentsByBranchYear,
  principalGetStudent,
  principalListAttendance,
  principalListMarks,
  principalListFees,
  principalListEvents,
  principalListNotifications,
  principalStats,
  principalCreateHOD,
  principalUpdateHOD,
  principalDeleteHOD,
  principalCreateTeacher,
  principalUpdateTeacher,
  principalDeleteTeacher,
  principalCreateStudent,
  principalUpdateStudent,
  principalDeleteStudent,
  principalUpdateProfile,
  principalListAnnouncements,
  principalCreateAnnouncement,
  principalDeleteAnnouncement,
} = require('../controllers/rbacController');

const router = express.Router();

router.use(verifyJwt, requireRole(['principal']));

router.get('/stats', principalStats);
router.get('/hods', principalListHODs);
router.get('/hods/:id', principalGetHOD);
router.get('/teachers', principalListTeachers);
router.get('/teachers/:branch', principalListTeachersByBranch);
router.get('/teachers/:branch/:id', principalGetTeacher);
router.get('/students', principalListStudents);
router.get('/students/:branch/:year', principalListStudentsByBranchYear);
router.get('/students/:branch/:year/:rollNo', principalGetStudent);
router.get('/attendance', principalListAttendance);
router.get('/marks', principalListMarks);
router.get('/fees', principalListFees);
router.get('/events', principalListEvents);
router.get('/notifications', principalListNotifications);

// Manage HODs
router.post('/hods', principalCreateHOD);
router.put('/hods/:id', principalUpdateHOD);
router.delete('/hods/:id', principalDeleteHOD);

// Manage Teachers (per branch)
router.post('/teachers/:branch', principalCreateTeacher);
router.put('/teachers/:branch/:id', principalUpdateTeacher);
router.delete('/teachers/:branch/:id', principalDeleteTeacher);

// Manage Students (per branch/year)
router.post('/students/:branch/:year', principalCreateStudent);
router.put('/students/:branch/:year/:rollNo', principalUpdateStudent);
router.delete('/students/:branch/:year/:rollNo', principalDeleteStudent);

// Profile management
router.put('/profile', principalUpdateProfile);

// Announcements management
router.get('/announcements', principalListAnnouncements);
router.post('/announcements', principalCreateAnnouncement);
router.delete('/announcements/:id', principalDeleteAnnouncement);

module.exports = router;


