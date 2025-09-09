const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listEvents, createEvent, updateEvent } = require('../controllers/eventsController');

const router = express.Router();

router.get('/', verifyJwt, listEvents);
router.post('/', verifyJwt, requireRole(['hod']), createEvent);
router.put('/:id', verifyJwt, requireRole(['hod']), updateEvent);

module.exports = router;
