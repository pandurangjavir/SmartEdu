const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listStudents, listAllStudentsUnion, getMyProfile, updateMyProfile } = require('../controllers/studentsController');

const router = express.Router();

// HOD view students by year
router.get('/', authMiddleware, requireRole(['hod']), listStudents);

// Alias: HOD view all students (union)
router.get('/all', authMiddleware, requireRole(['hod']), listAllStudentsUnion);

// Student self-view
router.get('/me', authMiddleware, getMyProfile);

// Student update own profile (username/password)
router.put('/me', authMiddleware, updateMyProfile);

module.exports = router;
