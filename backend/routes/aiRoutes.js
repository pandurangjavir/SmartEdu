const express = require('express');
const { generateNotes, generateQuiz, answerQuestion, generateSyllabus, upload } = require('../controllers/aiController');
const { verifyJwt } = require('../middleware/authMiddleware');

const router = express.Router();

// AI service routes
router.post('/notes', verifyJwt, upload.single('file'), generateNotes);
router.post('/quiz', verifyJwt, upload.single('file'), generateQuiz);
router.post('/qa', verifyJwt, answerQuestion);
router.post('/syllabus', verifyJwt, upload.single('file'), generateSyllabus);

module.exports = router;
