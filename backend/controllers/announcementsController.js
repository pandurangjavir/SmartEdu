const { pool } = require('../config/db');

async function listAnnouncements(req, res) {
	try {
		// Use branch-specific notifications table aligned to rest of app schema
		const [rows] = await pool.query('SELECT id, title as title, message as body, type, created_at, updated_at FROM Notifications_CSE ORDER BY created_at DESC');
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function createAnnouncement(req, res) {
	try {
		const { title, body, type = 'general', target_audience = 'all', target_year = 'all' } = req.body;
		if (!title || !body) return res.status(400).json({ msg: 'title and body are required' });
		const [result] = await pool.query(
			'INSERT INTO Notifications_CSE (title, message, type, target_audience, target_year, is_active, created_by) VALUES (?, ?, ?, ?, ?, TRUE, ?)',
			[title, body, type, target_audience, target_year, req.user?.id || 1]
		);
		return res.status(201).json({ id: result.insertId, title, body, type, target_audience, target_year });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function updateAnnouncement(req, res) {
	try {
		const { id } = req.params;
		const { title, body, type, is_active, target_audience, target_year } = req.body;
		const [result] = await pool.query(
			'UPDATE Notifications_CSE SET title = COALESCE(?, title), message = COALESCE(?, message), type = COALESCE(?, type), is_active = COALESCE(?, is_active), target_audience = COALESCE(?, target_audience), target_year = COALESCE(?, target_year), updated_at = NOW() WHERE id = ?',
			[title || null, body || null, type || null, typeof is_active === 'boolean' ? is_active : null, target_audience || null, target_year || null, id]
		);
		if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
		return res.json({ msg: 'Updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { listAnnouncements, createAnnouncement, updateAnnouncement };
