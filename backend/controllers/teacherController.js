const { pool } = require('../config/db');

// HOD view all teachers
async function getTeachers(req, res) {
	if (!req.user || req.user.role !== 'hod') return res.status(403).json({ msg: 'Access denied' });

	try {
		const [rows] = await pool.query('SELECT id, name, email, subject FROM Teachers_CSE');
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

// Teacher self-profile
async function getMyProfile(req, res) {
	if (!req.user || req.user.role !== 'teacher') return res.status(403).json({ msg: 'Access denied' });

	try {
		const [rows] = await pool.query('SELECT id, name, email, subject FROM Teachers_CSE WHERE id = ?', [req.user.id]);
		return res.json(rows[0]);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { getTeachers, getMyProfile };
