const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function listTeachers(req, res) {
	try {
		const [rows] = await pool.query('SELECT id, name, email, subject, contact, username FROM Teachers_CSE');
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function getMyProfile(req, res) {
	try {
		const user = req.user;
		if (user.role !== 'teacher') return res.status(403).json({ msg: 'Forbidden' });
		const [rows] = await pool.query('SELECT id, name, email, subject, contact, username FROM Teachers_CSE WHERE id = ?', [user.id]);
		if (rows.length === 0) return res.status(404).json({ msg: 'Not found' });
		return res.json(rows[0]);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function updateMyProfile(req, res) {
	try {
		const user = req.user;
		if (user.role !== 'teacher') return res.status(403).json({ msg: 'Forbidden' });
		const { username, password } = req.body;
		if (!username && !password) return res.status(400).json({ msg: 'Nothing to update' });
		let query = 'UPDATE Teachers_CSE SET ';
		const params = [];
		if (username) {
			query += 'username = ?';
			params.push(username);
		}
		if (password) {
			const hash = await bcrypt.hash(password, 10);
			if (params.length) query += ', ';
			query += 'password = ?';
			params.push(hash);
		}
		query += ' WHERE id = ?';
		params.push(user.id);
		const [result] = await pool.query(query, params);
		if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
		return res.json({ msg: 'Profile updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { listTeachers, getMyProfile, updateMyProfile };
