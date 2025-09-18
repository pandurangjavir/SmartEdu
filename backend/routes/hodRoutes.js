const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');
const { ensureHodBranchAccess } = require('../middleware/branchMiddleware');
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
  hodUpdateTeacher,
  hodUpdateStudent,
  hodCreateTeacher,
  hodDeleteTeacher,
  hodCreateStudent,
  hodDeleteStudent,
} = require('../controllers/rbacController');

const router = express.Router();

router.use(verifyJwt, requireRole(['hod']), auditLog);

router.get('/teachers/:branch', ensureHodBranchAccess, hodListTeachers);
router.get('/students/:branch/:year', ensureHodBranchAccess, hodListStudents);
router.get('/attendance/:branch/:year', ensureHodBranchAccess, hodListAttendance);
router.get('/marks/:branch/:year', ensureHodBranchAccess, hodListMarks);
router.get('/fees/:branch/:year', ensureHodBranchAccess, hodListFees);
router.get('/attendance-defaulters/:branch/:year', ensureHodBranchAccess, hodAttendanceDefaulters);
router.get('/fees-defaulters/:branch/:year', ensureHodBranchAccess, hodFeesDefaulters);
router.get('/events/:branch', ensureHodBranchAccess, hodListEvents);
router.get('/notifications/:branch', ensureHodBranchAccess, hodListNotifications);

// HOD edit endpoints
router.put('/teachers/:id', ensureHodBranchAccess, hodUpdateTeacher);
router.put('/students/:branch/:year/:rollNo', ensureHodBranchAccess, hodUpdateStudent);

router.post('/teachers', ensureHodBranchAccess, hodCreateTeacher);
router.delete('/teachers/:id', ensureHodBranchAccess, hodDeleteTeacher);
router.post('/students/:branch/:year', ensureHodBranchAccess, hodCreateStudent);
router.delete('/students/:branch/:year/:rollNo', ensureHodBranchAccess, hodDeleteStudent);

module.exports = router;
