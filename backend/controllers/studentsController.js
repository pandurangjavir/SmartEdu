const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function listStudents(req, res) {
	try {
		const { year } = req.query;
		if (!year || !['SY', 'TY', 'BE'].includes(year)) {
			return res.status(400).json({ msg: 'year query required: SY|TY|BE' });
		}
		const table = year === 'SY' ? 'Students_SY_CSE' : year === 'TY' ? 'Students_TY_CSE' : 'Students_BE_CSE';
		const [rows] = await pool.query(`SELECT roll_no, name, email, contact, username, admission_year FROM ${table}`);
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function listAllStudentsUnion(req, res) {
	try {
		const [rows] = await pool.query(
			"SELECT 'SY' AS year, roll_no, name, email, contact, username, admission_year FROM Students_SY_CSE " +
			"UNION ALL SELECT 'TY' AS year, roll_no, name, email, contact, username, admission_year FROM Students_TY_CSE " +
			"UNION ALL SELECT 'BE' AS year, roll_no, name, email, contact, username, admission_year FROM Students_BE_CSE"
		);
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function getMyProfile(req, res) {
	try {
		const user = req.user;
		if (user.role !== 'student') return res.status(403).json({ msg: 'Forbidden' });
		const table = user.table || (user.year === 'SY' ? 'Students_SY_CSE' : user.year === 'TY' ? 'Students_TY_CSE' : 'Students_BE_CSE');
		const idField = 'roll_no';
		const [rows] = await pool.query(`SELECT roll_no, name, email, contact, username, admission_year FROM ${table} WHERE ${idField} = ?`, [user.id]);
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
		if (user.role !== 'student') return res.status(403).json({ msg: 'Forbidden' });
		const { username, password } = req.body;
		const table = user.table || (user.year === 'SY' ? 'Students_SY_CSE' : user.year === 'TY' ? 'Students_TY_CSE' : 'Students_BE_CSE');
		if (!username && !password) return res.status(400).json({ msg: 'Nothing to update' });
		let query = `UPDATE ${table} SET `;
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
		query += ' WHERE roll_no = ?';
		params.push(user.id);
		const [result] = await pool.query(query, params);
		if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
		return res.json({ msg: 'Profile updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { listStudents, listAllStudentsUnion, getMyProfile, updateMyProfile };
