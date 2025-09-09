const express = require('express');
const { verifyJwt } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getMyFees, getAllFees } = require('../controllers/feesController');
const { pool } = require('../config/db');

const router = express.Router();

router.get('/me', verifyJwt, getMyFees);
router.get('/', verifyJwt, async (req, res, next) => {
	try {
		if (req.user?.role === 'student') {
			return getMyFees(req, res);
		}
		if (req.user?.role === 'hod') {
			return getAllFees(req, res);
		}
		return res.status(403).json({ msg: 'Forbidden' });
	} catch (e) {
		return next(e);
	}
});

// For chatbot: get fees by roll number (demo endpoint)
router.get('/:rollNo', async (req, res) => {
	try {
		const { rollNo } = req.params;
		
		// Try to find fees in all year tables
		const [syFees] = await pool.query('SELECT *, "SY" as year FROM Fees_SY_CSE WHERE roll_no = ?', [rollNo]);
		const [tyFees] = await pool.query('SELECT *, "TY" as year FROM Fees_TY_CSE WHERE roll_no = ?', [rollNo]);
		const [beFees] = await pool.query('SELECT *, "BE" as year FROM Fees_BE_CSE WHERE roll_no = ?', [rollNo]);
		
		const allFees = [...syFees, ...tyFees, ...beFees];
		if (allFees.length === 0) {
			return res.status(404).json({ msg: 'No fee records found.' });
		}
		
		// Return the first fee record found (or all if multiple)
		return res.json(allFees.length === 1 ? allFees[0] : allFees);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
});

module.exports = router;
