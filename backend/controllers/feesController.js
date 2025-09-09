const { pool } = require('../config/db');

// Helper function to get fees table name based on user's table
function getFeesTableName(userTable) {
	if (userTable === 'Students_SY_CSE') return 'Fees_SY_CSE';
	if (userTable === 'Students_TY_CSE') return 'Fees_TY_CSE';
	if (userTable === 'Students_BE_CSE') return 'Fees_BE_CSE';
	return null;
}

// Student view own fees
async function getMyFees(req, res) {
	if (!req.user || req.user.role !== 'student') return res.status(403).json({ msg: 'Access denied' });

	try {
		const feesTable = getFeesTableName(req.user.table);
		if (!feesTable) {
			return res.status(400).json({ msg: 'Invalid student table' });
		}

		const [rows] = await pool.query(`SELECT * FROM ${feesTable} WHERE roll_no = ?`, [req.user.id]);
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

// HOD view all fees
async function getAllFees(req, res) {
	if (!req.user || req.user.role !== 'hod') return res.status(403).json({ msg: 'Access denied' });

	try {
		// Get fees from all year tables
		const [syFees] = await pool.query('SELECT *, "SY" as year FROM Fees_SY_CSE');
		const [tyFees] = await pool.query('SELECT *, "TY" as year FROM Fees_TY_CSE');
		const [beFees] = await pool.query('SELECT *, "BE" as year FROM Fees_BE_CSE');
		
		const allFees = [...syFees, ...tyFees, ...beFees];
		return res.json(allFees);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { getMyFees, getAllFees };
