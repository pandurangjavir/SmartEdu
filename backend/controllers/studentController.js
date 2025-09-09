const { pool } = require('../config/db');

// Get all students (HOD only)
async function getStudents(req, res) {
	if (!req.user || req.user.role !== 'hod') return res.status(403).json({ msg: 'Access denied' });

	try {
		const [rows] = await pool.query('SELECT roll_no, name, email, admission_year FROM Students_SY_CSE');
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

// Student self-profile
async function getMyProfile(req, res) {
	if (!req.user || req.user.role !== 'student') return res.status(403).json({ msg: 'Access denied' });

	try {
		const table = req.user.table;
		const [rows] = await pool.query(`SELECT roll_no, name, email, admission_year FROM ${table} WHERE roll_no = ?`, [req.user.id]);
		return res.json(rows[0]);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { getStudents, getMyProfile };
