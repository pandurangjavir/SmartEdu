const { pool } = require('../config/db');

function tableFor(base, year, branch) {
  return `${base}_${(year || '').toLowerCase()}_${(branch || '').toLowerCase()}`;
}

// Principal
async function principalListHODs(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM hods');
    return res.json(rows);
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
    // Only CSE exists
    const [rows] = await pool.query('SELECT * FROM teachers_cse');
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
    const [rows] = await pool.query('SELECT * FROM events_cse');
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

async function hodListNotifications(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications_cse');
    return res.json(rows);
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

module.exports = {
  // Principal
  principalListHODs,
  principalListTeachers,
  principalListStudents,
  principalListAttendance,
  principalListMarks,
  principalListFees,
  principalListEvents,
  principalListNotifications,
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
};


