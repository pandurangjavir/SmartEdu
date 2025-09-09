const { pool } = require('../config/db');

/**
 * Roles: principal, hod, teacher, student
 * Year (only for students): SY, TY, BE (nullable for non-students)
 */
async function findUser({ username, role, year }) {
	const query = `
		SELECT id, username, password_hash AS passwordHash, role, year
		FROM users
		WHERE username = ? AND role = ? AND (year <=> ?)
		LIMIT 1
	`;
	const params = [username, role, role === 'student' ? year || null : null];
	const [rows] = await pool.query(query, params);
	return rows[0] || null;
}

async function createUser({ username, passwordHash, role, year }) {
	const query = `
		INSERT INTO users (username, password_hash, role, year)
		VALUES (?, ?, ?, ?)
	`;
	const params = [username, passwordHash, role, role === 'student' ? year || null : null];
	const [result] = await pool.query(query, params);
	return { id: result.insertId, username, role, year: role === 'student' ? year || null : null };
}

module.exports = { findUser, createUser };
