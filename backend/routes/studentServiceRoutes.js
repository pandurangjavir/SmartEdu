const express = require('express');
const { getNotifications, getEvents, registerForEvent, getMarks, getAttendance, getFees, updateMarks, updateAttendance, updateFees, getAllStudentServicesData } = require('../controllers/studentServiceController');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Student service routes (explicit paths)
router.get('/notifications', verifyJwt, getNotifications);
router.get('/events', verifyJwt, getEvents);
router.post('/events/:eventId/register', verifyJwt, registerForEvent);
router.get('/marks', verifyJwt, getMarks);
router.get('/attendance', verifyJwt, getAttendance);
router.get('/fees', verifyJwt, getFees);
router.get('/all', verifyJwt, getAllStudentServicesData);

// Update routes (HOD and Principal only)
router.put('/marks', verifyJwt, requireRole(['hod', 'principal']), updateMarks);
router.put('/attendance', verifyJwt, requireRole(['hod', 'principal']), updateAttendance);
router.put('/fees', verifyJwt, requireRole(['hod', 'principal']), updateFees);

module.exports = router;
