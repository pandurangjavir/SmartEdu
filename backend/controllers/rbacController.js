const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

function capitalizeBase(base) {
  const lower = (base || '').toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function tableFor(base, year, branch) {
  const Base = capitalizeBase(base);
  const YEAR = (year || '').toUpperCase();
  const BRANCH = (branch || '').toUpperCase();
  return `${Base}_${YEAR}_${BRANCH}`;
}

// Principal
async function principalListHODs(req, res) {
  try {
    const { q = '', page = 1, pageSize = 10, branch } = req.query;
    const query = `%${q}%`;
    const clauses = [];
    const params = [];
    if (q) {
      clauses.push('(name LIKE ? OR email LIKE ? OR username LIKE ? OR branch LIKE ?)');
      params.push(query, query, query, query);
    }
    if (branch) {
      clauses.push('branch = ?');
      params.push(String(branch).toUpperCase());
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [[countRow]] = await pool.query(`SELECT COUNT(*) as total FROM HODs ${where}`, params);
    const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
    const offset = Math.max(0, (parseInt(page, 10) - 1) * limit);
    const [rows] = await pool.query(`SELECT * FROM HODs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    return res.json({ rows, total: countRow.total });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function principalGetHOD(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM HODs WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ msg: 'Not found' });
    return res.json(rows[0]);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

// Principal: manage HODs
async function principalCreateHOD(req, res) {
  try {
    const { name, email, contact, username, password, branch } = req.body;
    if (!name || !email || !username || !branch) return res.status(400).json({ msg: 'name, email, username, branch are required' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    const hash = await bcrypt.hash(password || 'password', 10);
    const [result] = await pool.query(
      'INSERT INTO HODs (name, email, contact, username, password, branch) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, contact || null, username, hash, branch.toUpperCase()]
    );
    return res.status(201).json({ id: result.insertId, name, email, contact: contact || null, username, branch: branch.toUpperCase() });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalUpdateHOD(req, res) {
  try {
    const { id } = req.params;
    const { name, email, contact, username, branch } = req.body;
    if (!name && !email && !contact && !username && !branch) return res.status(400).json({ msg: 'Nothing to update' });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (contact !== undefined) { fields.push('contact = ?'); params.push(contact); }
    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (branch !== undefined) { fields.push('branch = ?'); params.push(branch.toUpperCase()); }
    const sql = `UPDATE HODs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'HOD updated' });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalDeleteHOD(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM HODs WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'HOD deleted' });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

// Principal: manage Teachers per department
async function principalCreateTeacher(req, res) {
  try {
    const { branch } = req.params;
    const { name, email, contact, username, subject, password } = req.body;
    if (!name || !email || !username) return res.status(400).json({ msg: 'name, email, username are required' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });
    const hash = await bcrypt.hash(password || 'password', 10);
    const table = `Teachers_${branch.toUpperCase()}`;
    const [result] = await pool.query(
      `INSERT INTO ${table} (name, email, contact, username, password, subject) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, contact || null, username, hash, subject || null]
    );
    return res.status(201).json({ id: result.insertId, name, email, contact: contact || null, username, subject: subject || null });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalUpdateTeacher(req, res) {
  try {
    const { branch, id } = req.params;
    const { name, email, contact, username, subject } = req.body;
    if (!name && !email && !contact && !username && !subject) return res.status(400).json({ msg: 'Nothing to update' });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (contact !== undefined) { fields.push('contact = ?'); params.push(contact); }
    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (subject !== undefined) { fields.push('subject = ?'); params.push(subject); }
    const table = `Teachers_${branch.toUpperCase()}`;
    const sql = `UPDATE ${table} SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Teacher updated' });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalDeleteTeacher(req, res) {
  try {
    const { branch, id } = req.params;
    const table = `Teachers_${branch.toUpperCase()}`;
    const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Teacher deleted' });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

// Principal: manage Students per department/year
async function principalCreateStudent(req, res) {
  try {
    const { branch, year } = req.params;
    const { roll_no, name, email, contact, username, password, admission_year } = req.body;
    if (!['SY','TY','BE'].includes(year)) return res.status(400).json({ msg: 'Invalid year' });
    if (!roll_no || !name || !username) return res.status(400).json({ msg: 'roll_no, name, username are required' });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });
    const table = tableFor('students', year, branch);
    const hash = await bcrypt.hash(password || 'password', 10);
    const [result] = await pool.query(`INSERT INTO ${table} (roll_no, name, email, contact, username, password, admission_year) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [roll_no, name, email || null, contact || null, username, hash, admission_year || null]
    );
    return res.status(201).json({ roll_no, name, email: email || null, contact: contact || null, username, admission_year: admission_year || null });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalUpdateStudent(req, res) {
  try {
    const { branch, year, rollNo } = req.params;
    const { name, email, contact, username, admission_year } = req.body;
    if (!['SY','TY','BE'].includes(year)) return res.status(400).json({ msg: 'Invalid year' });
    if (!name && !email && !contact && !username && admission_year === undefined) return res.status(400).json({ msg: 'Nothing to update' });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });
    const table = tableFor('students', year, branch);
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (contact !== undefined) { fields.push('contact = ?'); params.push(contact); }
    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (admission_year !== undefined) { fields.push('admission_year = ?'); params.push(admission_year); }
    const sql = `UPDATE ${table} SET ${fields.join(', ')}, updated_at = NOW() WHERE roll_no = ?`;
    params.push(rollNo);
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Student updated' });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalDeleteStudent(req, res) {
  try {
    const { branch, year, rollNo } = req.params;
    if (!['SY','TY','BE'].includes(year)) return res.status(400).json({ msg: 'Invalid year' });
    const table = tableFor('students', year, branch);
    const [result] = await pool.query(`DELETE FROM ${table} WHERE roll_no = ?`, [rollNo]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Student deleted' });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

// Principal: Stats - counts for departments, teachers, and HODs
async function principalStats(req, res) {
  try {
    // Departments are inferred from distinct branches across HODs or events tables; fallback to known list
    const knownBranches = ['CSE', 'ENTC', 'CIVIL', 'MECH', 'AIDS', 'ELECTRICAL'];
    let departments = knownBranches;
    try {
      const [rows] = await pool.query('SELECT DISTINCT branch FROM HODs');
      const list = rows.map(r => (r.branch || '').toUpperCase()).filter(Boolean);
      if (list.length) departments = list;
    } catch {}

    let totalTeachers = 0;
    let totalStudents = 0;
    for (const br of departments) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM Teachers_${br}`);
        totalTeachers += (rows?.[0]?.count || 0);
      } catch {}
      // Sum students across SY/TY/BE per branch
      // Students per branch will also be accounted for by a global information_schema scan below
    }
    const [hodRows] = await pool.query('SELECT COUNT(*) as count FROM HODs');
    const totalHods = hodRows?.[0]?.count || 0;

    // Total students = sum of three year tables for CSE (since only CSE data is provided)
    // Explicitly use provided lowercase table names
    let studentsSY_CSE = 0, studentsTY_CSE = 0, studentsBE_CSE = 0;
    try { const [r] = await pool.query('SELECT COUNT(*) as count FROM students_sy_cse'); studentsSY_CSE = r?.[0]?.count || 0; } catch {}
    try { const [r] = await pool.query('SELECT COUNT(*) as count FROM students_ty_cse'); studentsTY_CSE = r?.[0]?.count || 0; } catch {}
    try { const [r] = await pool.query('SELECT COUNT(*) as count FROM students_be_cse'); studentsBE_CSE = r?.[0]?.count || 0; } catch {}
    totalStudents = studentsSY_CSE + studentsTY_CSE + studentsBE_CSE;

    return res.json({ departmentsCount: departments.length, totalTeachers, totalHods, totalStudents, departments, studentsBreakdown: { SY_CSE: studentsSY_CSE, TY_CSE: studentsTY_CSE, BE_CSE: studentsBE_CSE } });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function principalListTeachers(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers_cse');
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Principal: list teachers by branch
async function principalListTeachersByBranch(req, res) {
  try {
    const { branch } = req.params;
    const { q = '', page = 1, pageSize = 10 } = req.query;
    const table = `Teachers_${(branch || 'CSE').toUpperCase()}`;
    const query = `%${q}%`;
    const where = q ? 'WHERE name LIKE ? OR email LIKE ? OR username LIKE ? OR subject LIKE ?' : '';
    const params = q ? [query, query, query, query] : [];
    const [[countRow]] = await pool.query(`SELECT COUNT(*) as total FROM ${table} ${where}`, params);
    const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
    const offset = Math.max(0, (parseInt(page, 10) - 1) * limit);
    const [rows] = await pool.query(`SELECT * FROM ${table} ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    return res.json({ rows, total: countRow.total });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalGetTeacher(req, res) {
  try {
    const { branch, id } = req.params;
    const table = `Teachers_${(branch || 'CSE').toUpperCase()}`;
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ msg: 'Not found' });
    return res.json(rows[0]);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalListStudents(req, res) {
  try {
    const [sy] = await pool.query('SELECT *, "SY" as year FROM students_sy_cse');
    const [ty] = await pool.query('SELECT *, "TY" as year FROM students_ty_cse');
    const [be] = await pool.query('SELECT *, "BE" as year FROM students_be_cse');
    return res.json([ ...sy, ...ty, ...be ]);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Principal: list students by branch/year
async function principalListStudentsByBranchYear(req, res) {
  try {
    const { branch, year } = req.params;
    const { q = '', page = 1, pageSize = 10 } = req.query;
    const table = tableFor('students', year, branch);
    const query = `%${q}%`;
    const where = q ? 'WHERE roll_no LIKE ? OR name LIKE ? OR email LIKE ? OR username LIKE ?' : '';
    const params = q ? [query, query, query, query] : [];
    const [[countRow]] = await pool.query(`SELECT COUNT(*) as total FROM ${table} ${where}`, params);
    const limit = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
    const offset = Math.max(0, (parseInt(page, 10) - 1) * limit);
    const [rows] = await pool.query(`SELECT * FROM ${table} ${where} ORDER BY roll_no ASC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    return res.json({ rows, total: countRow.total });
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalGetStudent(req, res) {
  try {
    const { branch, year, rollNo } = req.params;
    const table = tableFor('students', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE roll_no = ?`, [rollNo]);
    if (!rows.length) return res.status(404).json({ msg: 'Not found' });
    return res.json(rows[0]);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function principalListAttendance(req, res) {
  try {
    const [sy] = await pool.query('SELECT *, "SY" as year FROM attendance_sy_cse');
    const [ty] = await pool.query('SELECT *, "TY" as year FROM attendance_ty_cse');
    const [be] = await pool.query('SELECT *, "BE" as year FROM attendance_be_cse');
    return res.json([ ...sy, ...ty, ...be ]);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function principalListMarks(req, res) {
  try {
    const [sy] = await pool.query('SELECT *, "SY" as year FROM marks_sy_cse');
    const [ty] = await pool.query('SELECT *, "TY" as year FROM marks_ty_cse');
    const [be] = await pool.query('SELECT *, "BE" as year FROM marks_be_cse');
    return res.json([ ...sy, ...ty, ...be ]);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function principalListFees(req, res) {
  try {
    const [sy] = await pool.query('SELECT *, "SY" as year FROM fees_sy_cse');
    const [ty] = await pool.query('SELECT *, "TY" as year FROM fees_ty_cse');
    const [be] = await pool.query('SELECT *, "BE" as year FROM fees_be_cse');
    return res.json([ ...sy, ...ty, ...be ]);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function principalListEvents(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM events_cse');
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function principalListNotifications(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications_cse');
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD (branch)
async function hodListTeachers(req, res) {
  try {
    const BRANCH = (req.params.branch || req.hodBranch || 'CSE').toUpperCase();
    const [rows] = await pool.query(`SELECT * FROM Teachers_${BRANCH}`);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function hodListStudents(req, res) {
  try {
    const { branch, year } = req.params;
    const studentsTable = tableFor('students', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${studentsTable}`);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function hodListAttendance(req, res) {
  try {
    const { branch, year } = req.params;
    const table = tableFor('attendance', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${table}`);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function hodListMarks(req, res) {
  try {
    const { branch, year } = req.params;
    const table = tableFor('marks', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${table}`);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function hodListFees(req, res) {
  try {
    const { branch, year } = req.params;
    const table = tableFor('fees', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${table}`);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Attendance defaulters (e.g., below 75%)
async function hodAttendanceDefaulters(req, res) {
  try {
    const { branch, year } = req.params;
    const attendanceTable = tableFor('attendance', year, branch);
    const studentsTable = tableFor('students', year, branch);
    const [rows] = await pool.query(`
      SELECT a.*, s.name as student_name, s.roll_no as student_roll_no
      FROM ${attendanceTable} a
      JOIN ${studentsTable} s ON a.student_id = s.roll_no
      WHERE a.total_percentage < 75
      ORDER BY CAST(s.roll_no AS UNSIGNED) ASC
    `);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Fees defaulters (remaining > 0)
async function hodFeesDefaulters(req, res) {
  try {
    const { branch, year } = req.params;
    const feesTable = tableFor('fees', year, branch);
    const studentsTable = tableFor('students', year, branch);
    const [rows] = await pool.query(`
      SELECT f.*, s.name as student_name, s.roll_no as student_roll_no
      FROM ${feesTable} f
      JOIN ${studentsTable} s ON f.student_id = s.roll_no
      WHERE f.remaining_fees > 0
      ORDER BY CAST(s.roll_no AS UNSIGNED) ASC
    `);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function hodListEvents(req, res) {
  try {
    const BRANCH = (req.params.branch || req.hodBranch || 'CSE').toUpperCase();
    const [rows] = await pool.query(`SELECT * FROM Events_${BRANCH}`);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function hodListNotifications(req, res) {
  try {
    const BRANCH = (req.params.branch || req.hodBranch || 'CSE').toUpperCase();
    const [rows] = await pool.query(`SELECT * FROM Notifications_${BRANCH}`);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Update a teacher's basic profile fields
async function hodUpdateTeacher(req, res) {
  try {
    const { id } = req.params;
    const { name, email, contact, username, subject } = req.body;
    if (!name && !email && !contact && !username && !subject) {
      return res.status(400).json({ msg: 'Nothing to update' });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });

    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (contact !== undefined) { fields.push('contact = ?'); params.push(contact); }
    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (subject !== undefined) { fields.push('subject = ?'); params.push(subject); }

    const sql = `UPDATE teachers_cse SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Teacher updated' });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Update a student's basic profile fields by year table
async function hodUpdateStudent(req, res) {
  try {
    const { branch, year, rollNo } = req.params;
    const { name, email, contact, username, admission_year } = req.body;
    if (!['SY', 'TY', 'BE'].includes(year)) {
      return res.status(400).json({ msg: 'Invalid year' });
    }
    if (!name && !email && !contact && !username && admission_year === undefined) {
      return res.status(400).json({ msg: 'Nothing to update' });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });

    const table = tableFor('students', year, branch);
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (contact !== undefined) { fields.push('contact = ?'); params.push(contact); }
    if (username !== undefined) { fields.push('username = ?'); params.push(username); }
    if (admission_year !== undefined) { fields.push('admission_year = ?'); params.push(admission_year); }

    const sql = `UPDATE ${table} SET ${fields.join(', ')}, updated_at = NOW() WHERE roll_no = ?`;
    params.push(rollNo);
    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Student updated' });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Create a new teacher (password optional, default 'password')
async function hodCreateTeacher(req, res) {
  try {
    const { name, email, contact, username, subject, password } = req.body;
    if (!name || !email || !username) {
      return res.status(400).json({ msg: 'name, email, username are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });
    const hashed = await bcrypt.hash(password || 'password', 10);
    const [result] = await pool.query(
      'INSERT INTO teachers_cse (name, email, contact, username, password, subject) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, contact || null, username, hashed, subject || null]
    );
    return res.status(201).json({ id: result.insertId, name, email, contact: contact || null, username, subject: subject || null });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Delete a teacher by id
async function hodDeleteTeacher(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM teachers_cse WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Teacher deleted' });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Create a new student in specific year table (defaults branch CSE)
async function hodCreateStudent(req, res) {
  try {
    const { branch, year } = req.params;
    const { roll_no, name, email, contact, username, password, admission_year } = req.body;
    if (!['SY', 'TY', 'BE'].includes(year)) return res.status(400).json({ msg: 'Invalid year' });
    if (!roll_no || !name || !username) return res.status(400).json({ msg: 'roll_no, name, username are required' });
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ msg: 'Invalid email' });
    if (contact && !/^\+?[0-9\-\s]{7,15}$/.test(contact)) return res.status(400).json({ msg: 'Invalid contact' });
    const table = tableFor('students', year, branch);
    const hashed = await bcrypt.hash(password || 'password', 10);
    const [result] = await pool.query(
      `INSERT INTO ${table} (roll_no, name, email, contact, username, password, admission_year) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [roll_no, name, email || null, contact || null, username, hashed, admission_year || null]
    );
    return res.status(201).json({ roll_no, name, email: email || null, contact: contact || null, username, admission_year: admission_year || null });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// HOD: Delete a student by roll_no in specific year table
async function hodDeleteStudent(req, res) {
  try {
    const { branch, year, rollNo } = req.params;
    if (!['SY', 'TY', 'BE'].includes(year)) return res.status(400).json({ msg: 'Invalid year' });
    const table = tableFor('students', year, branch);
    const [result] = await pool.query(`DELETE FROM ${table} WHERE roll_no = ?`, [rollNo]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json({ msg: 'Student deleted' });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Teacher
async function teacherProfile(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM teachers_cse WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Not found' });
    return res.json(rows[0]);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function teacherClasses(req, res) {
  try {
    const { branch, year } = req.params;
    const marksTable = tableFor('marks', year, branch);
    // Distinct subjects derived from 5 subject columns
    const [rows] = await pool.query(`
      SELECT DISTINCT subject1 as subject FROM ${marksTable} WHERE subject1 IS NOT NULL AND subject1 <> ''
      UNION SELECT DISTINCT subject2 FROM ${marksTable} WHERE subject2 IS NOT NULL AND subject2 <> ''
      UNION SELECT DISTINCT subject3 FROM ${marksTable} WHERE subject3 IS NOT NULL AND subject3 <> ''
      UNION SELECT DISTINCT subject4 FROM ${marksTable} WHERE subject4 IS NOT NULL AND subject4 <> ''
      UNION SELECT DISTINCT subject5 FROM ${marksTable} WHERE subject5 IS NOT NULL AND subject5 <> ''
    `);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function teacherAttendanceBySubject(req, res) {
  try {
    const { branch, year, subject } = req.params;
    const { semester } = req.query;
    const table = tableFor('attendance', year, branch);
    // Match subject across any of theory/practical names
    const [rows] = await pool.query(
      `SELECT * FROM ${table}
       WHERE (subject1_theory = ? OR subject1_practical = ?
          OR subject2_theory = ? OR subject2_practical = ?
          OR subject3_theory = ? OR subject3_practical = ?
          OR subject4_theory = ? OR subject4_practical = ?
          OR subject5_theory = ? OR subject5_practical = ?)
         ${semester ? 'AND semester = ?' : ''}`,
      semester
        ? [subject, subject, subject, subject, subject, subject, subject, subject, subject, subject, semester]
        : [subject, subject, subject, subject, subject, subject, subject, subject, subject, subject]
    );
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function teacherMarksBySubject(req, res) {
  try {
    const { branch, year, subject } = req.params;
    const { semester } = req.query;
    const table = tableFor('marks', year, branch);
    const [rows] = await pool.query(
      `SELECT * FROM ${table}
       WHERE (subject1 = ? OR subject2 = ? OR subject3 = ? OR subject4 = ? OR subject5 = ?)
         ${semester ? 'AND semester = ?' : ''}`,
      semester ? [subject, subject, subject, subject, subject, semester] : [subject, subject, subject, subject, subject]
    );
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Teacher: Fees by year (optional semester filter)
async function teacherFeesByYear(req, res) {
  try {
    const { branch, year } = req.params;
    const { semester } = req.query;
    const table = tableFor('fees', year, branch);
    const [rows] = await pool.query(
      `SELECT * FROM ${table} ${semester ? 'WHERE semester = ?' : ''} ORDER BY id DESC`,
      semester ? [semester] : []
    );
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function teacherEvents(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM events_cse');
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function teacherNotifications(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications_cse');
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Student (self)
async function studentProfile(req, res) {
  try {
    const { id } = req.params;
    // year not provided here; attempt across all
    const [sy] = await pool.query('SELECT *, "SY" as year FROM students_sy_cse WHERE roll_no = ?', [id]);
    if (sy.length) return res.json(sy[0]);
    const [ty] = await pool.query('SELECT *, "TY" as year FROM students_ty_cse WHERE roll_no = ?', [id]);
    if (ty.length) return res.json(ty[0]);
    const [be] = await pool.query('SELECT *, "BE" as year FROM students_be_cse WHERE roll_no = ?', [id]);
    if (be.length) return res.json(be[0]);
    return res.status(404).json({ msg: 'Not found' });
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function studentAttendance(req, res) {
  try {
    const { branch, year, id } = req.params;
    const table = tableFor('attendance', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE roll_no = ?`, [id]);
    return res.json(rows);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function studentMarks(req, res) {
  try {
    const { branch, year, id } = req.params;
    const table = tableFor('marks', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE roll_no = ?`, [id]);
    return res.json(rows);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function studentFees(req, res) {
  try {
    const { branch, year, id } = req.params;
    const table = tableFor('fees', year, branch);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE roll_no = ?`, [id]);
    return res.json(rows);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function studentEvents(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM events_cse');
    return res.json(rows);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

async function studentNotifications(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications_cse');
    return res.json(rows);
  } catch (e) { return res.status(500).json({ msg: 'Server error' }); }
}

// Principal Profile Update
async function principalUpdateProfile(req, res) {
  try {
    const { name, email, contact, username, password } = req.body;
    const userId = req.user.id;
    
    let updateQuery = 'UPDATE Principal SET name = ?, email = ?, contact = ?, username = ?';
    let queryParams = [name, email, contact, username];
    
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);
    
    await pool.query(updateQuery, queryParams);
    return res.json({ msg: 'Profile updated successfully' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Principal List Announcements
async function principalListAnnouncements(req, res) {
  try {
    // Get general announcements
    const [generalAnnouncements] = await pool.query('SELECT *, "general" as source FROM announcements ORDER BY created_at DESC');
    
    // Get department-specific announcements from all branches
    const branches = ['CSE', 'ENTC', 'CIVIL', 'MECH', 'AIDS', 'ELECTRICAL'];
    let allDeptAnnouncements = [];
    
    for (const branch of branches) {
      try {
        const [deptAnnouncements] = await pool.query(
          `SELECT *, "${branch}" as source, "department" as type FROM Notifications_${branch} ORDER BY created_at DESC`
        );
        allDeptAnnouncements = allDeptAnnouncements.concat(deptAnnouncements);
      } catch (e) {
        // Table might not exist for some branches, continue
        console.log(`Table Notifications_${branch} not found, skipping...`);
      }
    }
    
    // Combine and sort all announcements by created_at
    const allAnnouncements = [...generalAnnouncements, ...allDeptAnnouncements]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return res.json({ rows: allAnnouncements });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Principal Create Announcement
async function principalCreateAnnouncement(req, res) {
  try {
    const { title, message, target_audience } = req.body;
    const userId = req.user.id;
    
    await pool.query(
      'INSERT INTO announcements (title, message, target_audience, created_by, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, message, target_audience, userId]
    );
    
    return res.json({ msg: 'Announcement created successfully' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Principal Delete Announcement
async function principalDeleteAnnouncement(req, res) {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    
    return res.json({ msg: 'Announcement deleted successfully' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Server error' });
  }
}

module.exports = {
  // Principal
  principalListHODs,
  principalGetHOD,
  principalCreateHOD,
  principalUpdateHOD,
  principalDeleteHOD,
  principalListTeachers,
  principalListTeachersByBranch,
  principalGetTeacher,
  principalCreateTeacher,
  principalUpdateTeacher,
  principalDeleteTeacher,
  principalListStudents,
  principalListStudentsByBranchYear,
  principalGetStudent,
  principalCreateStudent,
  principalUpdateStudent,
  principalDeleteStudent,
  principalListAttendance,
  principalListMarks,
  principalListFees,
  principalListEvents,
  principalListNotifications,
  principalStats,
  // HOD
  hodListTeachers,
  hodListStudents,
  hodListAttendance,
  hodListMarks,
  hodListFees,
  hodAttendanceDefaulters,
  hodFeesDefaulters,
  hodListEvents,
  hodListNotifications,
  hodUpdateTeacher,
  hodUpdateStudent,
  // HOD create/delete
  hodCreateTeacher,
  hodDeleteTeacher,
  hodCreateStudent,
  hodDeleteStudent,
  // Teacher
  teacherProfile,
  teacherClasses,
  teacherAttendanceBySubject,
  teacherMarksBySubject,
  teacherFeesByYear,
  teacherEvents,
  teacherNotifications,
  // Student
  studentProfile,
  studentAttendance,
  studentMarks,
  studentFees,
  studentEvents,
  studentNotifications,
  // Principal Profile and Announcements
  principalUpdateProfile,
  principalListAnnouncements,
  principalCreateAnnouncement,
  principalDeleteAnnouncement,
};


