const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listAnnouncements, createAnnouncement, updateAnnouncement } = require('../controllers/announcementsController');

const router = express.Router();

router.get('/', verifyJwt, listAnnouncements);
router.post('/', verifyJwt, requireRole(['hod']), createAnnouncement);
router.put('/:id', verifyJwt, requireRole(['hod']), updateAnnouncement);

module.exports = router;
