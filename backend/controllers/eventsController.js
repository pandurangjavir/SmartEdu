const { pool } = require('../config/db');

async function listEvents(req, res) {
	try {
		const [rows] = await pool.query('SELECT id, title, description, event_date, registration_link FROM Events_CSE ORDER BY event_date DESC');
		return res.json(rows);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function createEvent(req, res) {
	try {
		const { title, description, event_date, registration_link } = req.body;
		if (!title || !event_date) return res.status(400).json({ msg: 'title and event_date are required' });
		const branch = 'CSE';
		const [result] = await pool.query('INSERT INTO Events_CSE (branch, title, description, event_date, registration_link) VALUES (?, ?, ?, ?, ?)', [branch, title, description || null, event_date, registration_link || null]);
		return res.status(201).json({ id: result.insertId, branch, title, description: description || null, event_date, registration_link: registration_link || null });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

async function updateEvent(req, res) {
	try {
		const { id } = req.params;
		const { title, description, event_date, registration_link } = req.body;
		const [result] = await pool.query('UPDATE Events_CSE SET title = COALESCE(?, title), description = COALESCE(?, description), event_date = COALESCE(?, event_date), registration_link = COALESCE(?, registration_link) WHERE id = ?', [title || null, description || null, event_date || null, registration_link || null, id]);
		if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
		return res.json({ msg: 'Updated' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ msg: 'Server error' });
	}
}

module.exports = { listEvents, createEvent, updateEvent };
