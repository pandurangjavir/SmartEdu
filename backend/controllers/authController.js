const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Utility: get table name
function getTableName(role, year) {
	if (role === 'principal') return 'Principal';
	if (role === 'hod') return 'HODs';
	if (role === 'teacher') return 'Teachers_CSE';
	if (role === 'student') {
		if (year === 'SY') return 'Students_SY_CSE';
		if (year === 'TY') return 'Students_TY_CSE';
		if (year === 'BE') return 'Students_BE_CSE';
	}
	return null;
}

async function testConnection(req, res) {
	try {
		const [rows] = await pool.query('SELECT 1 + 1 AS result');
		return res.json({ success: true, result: rows[0].result });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, error: err.message });
	}
}


// Login
async function login(req, res) {
	const { username, password, role, year } = req.body;

	try {
		const table = getTableName(role, year);
		if (!table) return res.status(400).json({ msg: 'Invalid role/year' });

		const [rows] = await pool.query(`SELECT * FROM ${table} WHERE username = ?`, [username]);
		if (rows.length === 0) return res.status(404).json({ msg: 'User not found' });

		const user = rows[0];
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

		const payload = { id: user.id || user.roll_no, role, table };
		const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

		return res.json({ token, role, user: { id: user.id || user.roll_no, name: user.name, email: user.email } });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

// Get user profile
async function getProfile(req, res) {
	try {
		const { id, role, table } = req.user;
		
		let query = '';
		if (role === 'student') {
			query = `SELECT roll_no as id, name, email, contact, username, admission_year FROM ${table} WHERE roll_no = ?`;
		} else {
			query = `SELECT id, name, email, contact, username FROM ${table} WHERE id = ?`;
		}
		
		const [rows] = await pool.query(query, [id]);
		if (rows.length === 0) return res.status(404).json({ msg: 'User not found' });
		
		const user = rows[0];
		return res.json({ 
			user: { 
				...user, 
				role,
				table 
			} 
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { testConnection, login, getProfile };
