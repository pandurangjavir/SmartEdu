const { pool } = require('../config/db');

// Helper: select rows for a student with flexible key names
async function selectRowsForStudent(tableName, userId) {
  const candidateColumns = ['roll_no', 'student_roll_no', 'student_id', 'rollno', 'sid', 'id'];
  for (const col of candidateColumns) {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE ${col} = ? ORDER BY id DESC`, [userId]);
      return rows;
    } catch (e) {
      if (e?.code !== 'ER_BAD_FIELD_ERROR') {
        throw e;
      }
      // try next column
    }
  }
  // As a last resort, return all rows to avoid a 500 (better to see data than break)
  const [fallbackRows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY id DESC`);
  return fallbackRows;
}

// Get notifications
async function getNotifications(req, res) {
  try {
    const { id: userId, role, table } = req.user;
    
    let query, params;
    
    if (role === 'student') {
      // Students can only see notifications for their year or general notifications
      let studentYear = null;
      if (table === 'Students_SY_CSE') studentYear = 'SY';
      else if (table === 'Students_TY_CSE') studentYear = 'TY';
      else if (table === 'Students_BE_CSE') studentYear = 'BE';
      
      query = `
        SELECT id, title, message, type, created_at, is_active
        FROM Notifications_CSE 
        WHERE is_active = TRUE 
        AND (target_audience = 'all' OR target_audience = 'students' OR target_year = ?)
        ORDER BY created_at DESC
      `;
      params = [studentYear];
    } else if (role === 'teacher') {
      // Teachers can see all notifications
      query = `
        SELECT id, title, message, type, created_at, is_active, target_audience, target_year
        FROM Notifications_CSE 
        WHERE is_active = TRUE 
        ORDER BY created_at DESC
      `;
      params = [];
    } else if (role === 'hod') {
      // HOD can see all notifications (CSE department)
      query = `
        SELECT id, title, message, type, created_at, is_active, target_audience, target_year
        FROM Notifications_CSE 
        WHERE is_active = TRUE 
        ORDER BY created_at DESC
      `;
      params = [];
    } else if (role === 'principal') {
      // Principal can see all notifications from all departments
      query = `
        SELECT id, title, message, type, created_at, is_active, target_audience, target_year
        FROM Notifications_CSE 
        WHERE is_active = TRUE 
        ORDER BY created_at DESC
      `;
      params = [];
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const [rows] = await pool.query(query, params);
    return res.json({ notifications: rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Get events
async function getEvents(req, res) {
  try {
    const { id: userId, role, table } = req.user;
    
    let query, params;
    
    if (role === 'student' || role === 'teacher' || role === 'hod' || role === 'principal') {
      // Show all upcoming events from Events_CSE regardless of optional tables
      query = `
        SELECT id, branch, title, description, event_date, registration_link
        FROM Events_CSE
        WHERE event_date >= CURDATE()
        ORDER BY event_date ASC
      `;
      params = [];
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const [rows] = await pool.query(query, params);
    return res.json({ events: rows });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Register for event
async function registerForEvent(req, res) {
  try {
    const { eventId } = req.params;
    const { id: userId, role, table } = req.user;
    
    // Check if already registered
    const [existing] = await pool.query(
      'SELECT id FROM Event_Registrations_CSE WHERE event_id = ? AND student_id = ? AND student_table = ?',
      [eventId, userId, table]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Already registered for this event' });
    }
    
    // Register for event
    await pool.execute(
      'INSERT INTO Event_Registrations_CSE (event_id, student_id, student_table) VALUES (?, ?, ?)',
      [eventId, userId, table]
    );
    
    return res.json({ msg: 'Successfully registered for event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Get marks
async function getMarks(req, res) {
  try {
    const { id: userId, role, table } = req.user;
    
    if (role === 'student') {
      // Students can only see their own marks
      let marksTable = 'Marks_TY_CSE'; // default
      if (table === 'Students_SY_CSE') marksTable = 'Marks_SY_CSE';
      else if (table === 'Students_TY_CSE') marksTable = 'Marks_TY_CSE';
      else if (table === 'Students_BE_CSE') marksTable = 'Marks_BE_CSE';
      
      const rows = await selectRowsForStudent(marksTable, userId);
      
      return res.json({ marks: rows });
    } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
      // Prefer enriched rows via join on student_id -> students.roll_no; fallback to raw rows
      const allMarks = [];
      const classes = [
        { table: 'Marks_SY_CSE', studentTable: 'Students_SY_CSE', year: 'SY' },
        { table: 'Marks_TY_CSE', studentTable: 'Students_TY_CSE', year: 'TY' },
        { table: 'Marks_BE_CSE', studentTable: 'Students_BE_CSE', year: 'BE' }
      ];
      for (const cls of classes) {
        try {
          const [rows] = await pool.query(
            `SELECT m.*, s.name AS student_name, s.roll_no AS student_roll_no
          FROM ${cls.table} m
             JOIN ${cls.studentTable} s ON m.student_id = s.roll_no
             ORDER BY CAST(s.roll_no AS UNSIGNED) ASC`
          );
          allMarks.push(...rows.map(r => ({ ...r, year: cls.year })));
        } catch (e) {
          try {
            const [rows] = await pool.query(`SELECT * FROM ${cls.table} ORDER BY id DESC`);
            allMarks.push(
              ...rows.map(r => ({
                ...r,
                year: cls.year,
                student_roll_no: r.roll_no || r.student_roll_no || r.student_id || r.sid || r.id,
              }))
            );
          } catch {}
        }
      }
      return res.json({ marks: allMarks });
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }
  } catch (error) {
    console.error('Error fetching marks:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Get attendance
async function getAttendance(req, res) {
  try {
    const { id: userId, role, table } = req.user;
    
    if (role === 'student') {
      // Students can only see their own attendance
      let attendanceTable = 'Attendance_TY_CSE'; // default
      if (table === 'Students_SY_CSE') attendanceTable = 'Attendance_SY_CSE';
      else if (table === 'Students_TY_CSE') attendanceTable = 'Attendance_TY_CSE';
      else if (table === 'Students_BE_CSE') attendanceTable = 'Attendance_BE_CSE';
      
      const rows = await selectRowsForStudent(attendanceTable, userId);
      
      return res.json({ attendance: rows });
    } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
      const allAttendance = [];
      const classes = [
        { table: 'Attendance_SY_CSE', studentTable: 'Students_SY_CSE', year: 'SY' },
        { table: 'Attendance_TY_CSE', studentTable: 'Students_TY_CSE', year: 'TY' },
        { table: 'Attendance_BE_CSE', studentTable: 'Students_BE_CSE', year: 'BE' }
      ];
      for (const cls of classes) {
        try {
          const [rows] = await pool.query(
            `SELECT a.*, s.name AS student_name, s.roll_no AS student_roll_no
          FROM ${cls.table} a
             JOIN ${cls.studentTable} s ON a.student_id = s.roll_no
             ORDER BY CAST(s.roll_no AS UNSIGNED) ASC`
          );
          allAttendance.push(...rows.map(r => ({ ...r, year: cls.year })));
        } catch (e) {
          try {
            const [rows] = await pool.query(`SELECT * FROM ${cls.table} ORDER BY id DESC`);
            allAttendance.push(
              ...rows.map(r => ({
                ...r,
                year: cls.year,
                student_roll_no: r.roll_no || r.student_roll_no || r.student_id || r.sid || r.id,
              }))
            );
          } catch {}
        }
      }
      return res.json({ attendance: allAttendance });
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Get fees
async function getFees(req, res) {
  try {
    const { id: userId, role, table } = req.user;
    
    if (role === 'student') {
      // Students can only see their own fees
      let feesTable = 'Fees_TY_CSE'; // default
      if (table === 'Students_SY_CSE') feesTable = 'Fees_SY_CSE';
      else if (table === 'Students_TY_CSE') feesTable = 'Fees_TY_CSE';
      else if (table === 'Students_BE_CSE') feesTable = 'Fees_BE_CSE';
      
      const rows = await selectRowsForStudent(feesTable, userId);
      
      return res.json({ fees: rows });
    } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
      const allFees = [];
      const classes = [
        { table: 'Fees_SY_CSE', studentTable: 'Students_SY_CSE', year: 'SY' },
        { table: 'Fees_TY_CSE', studentTable: 'Students_TY_CSE', year: 'TY' },
        { table: 'Fees_BE_CSE', studentTable: 'Students_BE_CSE', year: 'BE' }
      ];
      for (const cls of classes) {
        try {
          const [rows] = await pool.query(
            `SELECT f.*, s.name AS student_name, s.roll_no AS student_roll_no
          FROM ${cls.table} f
             JOIN ${cls.studentTable} s ON f.student_id = s.roll_no
             ORDER BY CAST(s.roll_no AS UNSIGNED) ASC`
          );
          allFees.push(...rows.map(r => ({ ...r, year: cls.year })));
        } catch (e) {
          try {
            const [rows] = await pool.query(`SELECT * FROM ${cls.table} ORDER BY id DESC`);
            allFees.push(
              ...rows.map(r => ({
                ...r,
                year: cls.year,
                student_roll_no: r.roll_no || r.student_roll_no || r.student_id || r.sid || r.id,
              }))
            );
          } catch {}
        }
      }
      return res.json({ fees: allFees });
    } else {
      return res.status(403).json({ msg: 'Access denied' });
    }
  } catch (error) {
    console.error('Error fetching fees:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Update marks (HOD and Principal only)
async function updateMarks(req, res) {
  try {
    const { role } = req.user;
    const { marksId, year, semester, examType, subject1, subject1Marks, subject2, subject2Marks, subject3, subject3Marks, subject4, subject4Marks, subject5, subject5Marks } = req.body;
    
    if (role !== 'hod' && role !== 'principal') {
      return res.status(403).json({ msg: 'Access denied. Only HOD and Principal can edit marks.' });
    }
    
    // Determine which marks table to update based on year
    let marksTable = 'Marks_TY_CSE'; // default
    if (year === 'SY') marksTable = 'Marks_SY_CSE';
    else if (year === 'TY') marksTable = 'Marks_TY_CSE';
    else if (year === 'BE') marksTable = 'Marks_BE_CSE';
    
    // Calculate total marks and percentage
    const totalMarks = subject1Marks + subject2Marks + subject3Marks + subject4Marks + subject5Marks;
    const totalPercentage = (totalMarks / 500) * 100;
    
    await pool.execute(`
      UPDATE ${marksTable} 
      SET subject1 = ?, subject1_marks = ?, subject1_total = 100,
          subject2 = ?, subject2_marks = ?, subject2_total = 100,
          subject3 = ?, subject3_marks = ?, subject3_total = 100,
          subject4 = ?, subject4_marks = ?, subject4_total = 100,
          subject5 = ?, subject5_marks = ?, subject5_total = 100,
          total_marks = ?, total_percentage = ?, exam_type = ?
      WHERE id = ?
    `, [subject1, subject1Marks, subject2, subject2Marks, subject3, subject3Marks, subject4, subject4Marks, subject5, subject5Marks, totalMarks, totalPercentage, examType, marksId]);
    
    return res.json({ msg: 'Marks updated successfully' });
  } catch (error) {
    console.error('Error updating marks:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Update attendance (HOD and Principal only)
async function updateAttendance(req, res) {
  try {
    const { role } = req.user;
    const { attendanceId, year, semester, subject1Theory, subject1TheoryPresent, subject1Practical, subject1PracticalPresent, subject2Theory, subject2TheoryPresent, subject2Practical, subject2PracticalPresent, subject3Theory, subject3TheoryPresent, subject3Practical, subject3PracticalPresent, subject4Theory, subject4TheoryPresent, subject4Practical, subject4PracticalPresent, subject5Theory, subject5TheoryPresent, subject5Practical, subject5PracticalPresent } = req.body;
    
    if (role !== 'hod' && role !== 'principal') {
      return res.status(403).json({ msg: 'Access denied. Only HOD and Principal can edit attendance.' });
    }
    
    // Determine which attendance table to update based on year
    let attendanceTable = 'Attendance_TY_CSE'; // default
    if (year === 'SY') attendanceTable = 'Attendance_SY_CSE';
    else if (year === 'TY') attendanceTable = 'Attendance_TY_CSE';
    else if (year === 'BE') attendanceTable = 'Attendance_BE_CSE';
    
    // Calculate totals
    const totalPresent = subject1TheoryPresent + subject1PracticalPresent + subject2TheoryPresent + subject2PracticalPresent + subject3TheoryPresent + subject3PracticalPresent + subject4TheoryPresent + subject4PracticalPresent + subject5TheoryPresent + subject5PracticalPresent;
    const totalClasses = 325; // Assuming 50 theory + 25 practical per subject * 5 subjects
    const totalPercentage = (totalPresent / totalClasses) * 100;
    
    await pool.execute(`
      UPDATE ${attendanceTable} 
      SET subject1_theory = ?, subject1_theory_present = ?, subject1_theory_total = 50,
          subject1_practical = ?, subject1_practical_present = ?, subject1_practical_total = 25,
          subject2_theory = ?, subject2_theory_present = ?, subject2_theory_total = 50,
          subject2_practical = ?, subject2_practical_present = ?, subject2_practical_total = 25,
          subject3_theory = ?, subject3_theory_present = ?, subject3_theory_total = 50,
          subject3_practical = ?, subject3_practical_present = ?, subject3_practical_total = 25,
          subject4_theory = ?, subject4_theory_present = ?, subject4_theory_total = 50,
          subject4_practical = ?, subject4_practical_present = ?, subject4_practical_total = 25,
          subject5_theory = ?, subject5_theory_present = ?, subject5_theory_total = 50,
          subject5_practical = ?, subject5_practical_present = ?, subject5_practical_total = 25,
          total_present = ?, total_classes = ?, total_percentage = ?
      WHERE id = ?
    `, [subject1Theory, subject1TheoryPresent, subject1Practical, subject1PracticalPresent, subject2Theory, subject2TheoryPresent, subject2Practical, subject2PracticalPresent, subject3Theory, subject3TheoryPresent, subject3Practical, subject3PracticalPresent, subject4Theory, subject4TheoryPresent, subject4Practical, subject4PracticalPresent, subject5Theory, subject5TheoryPresent, subject5Practical, subject5PracticalPresent, totalPresent, totalClasses, totalPercentage, attendanceId]);
    
    return res.json({ msg: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Update fees (HOD and Principal only)
async function updateFees(req, res) {
  try {
    const { role } = req.user;
    const { feesId, year, semester, totalFees, paidFees, lastPaidDate, dueDate } = req.body;
    
    if (role !== 'hod' && role !== 'principal') {
      return res.status(403).json({ msg: 'Access denied. Only HOD and Principal can edit fees.' });
    }
    
    // Determine which fees table to update based on year
    let feesTable = 'Fees_TY_CSE'; // default
    if (year === 'SY') feesTable = 'Fees_SY_CSE';
    else if (year === 'TY') feesTable = 'Fees_TY_CSE';
    else if (year === 'BE') feesTable = 'Fees_BE_CSE';
    
    const remainingFees = totalFees - paidFees;
    
    await pool.execute(`
      UPDATE ${feesTable} 
      SET total_fees = ?, paid_fees = ?, remaining_fees = ?, last_paid_date = ?, due_date = ?
      WHERE id = ?
    `, [totalFees, paidFees, remainingFees, lastPaidDate, dueDate, feesId]);
    
    return res.json({ msg: 'Fees updated successfully' });
  } catch (error) {
    console.error('Error updating fees:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Aggregate all student services data per role
async function getAllStudentServicesData(req, res) {
  try {
    // Notifications
    let notifications = [];
    try {
      const { id: userId, role, table } = req.user;
      let nQuery, nParams;
      if (role === 'student') {
        let studentYear = null;
        if (table === 'Students_SY_CSE') studentYear = 'SY';
        else if (table === 'Students_TY_CSE') studentYear = 'TY';
        else if (table === 'Students_BE_CSE') studentYear = 'BE';
        nQuery = `
          SELECT id, title, message, type, created_at, is_active
          FROM Notifications_CSE 
          WHERE is_active = TRUE 
          AND (target_audience = 'all' OR target_audience = 'students' OR target_year = ?)
          ORDER BY created_at DESC`;
        nParams = [studentYear];
      } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
        nQuery = `
          SELECT id, title, message, type, created_at, is_active, target_audience, target_year
          FROM Notifications_CSE 
          WHERE is_active = TRUE 
          ORDER BY created_at DESC`;
        nParams = [];
      }
      if (nQuery) {
        const [nRows] = await pool.query(nQuery, nParams);
        notifications = nRows;
      }
    } catch (e) {}

    // Events
    let events = [];
    try {
      const { id: userId, role, table } = req.user;
      let eQuery, eParams;
      if (role === 'student') {
        eQuery = `
          SELECT e.*, 
                 CASE WHEN er.id IS NOT NULL THEN 1 ELSE 0 END as is_registered
          FROM Events_CSE e
          LEFT JOIN Event_Registrations_CSE er ON e.id = er.event_id AND er.student_id = ? AND er.student_table = ?
          WHERE e.event_date >= CURDATE()
          ORDER BY e.event_date ASC`;
        eParams = [req.user.id, req.user.table];
      } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
        eQuery = `
          SELECT e.*, COUNT(er.id) as registration_count
          FROM Events_CSE e
          LEFT JOIN Event_Registrations_CSE er ON e.id = er.event_id
          WHERE e.event_date >= CURDATE()
          GROUP BY e.id
          ORDER BY e.event_date ASC`;
        eParams = [];
      }
      if (eQuery) {
        const [eRows] = await pool.query(eQuery, eParams);
        events = eRows;
      }
    } catch (e) {}

    // Marks
    let marks = [];
    try {
      const { role, table } = req.user;
      if (role === 'student') {
        let marksTable = 'Marks_TY_CSE';
        if (table === 'Students_SY_CSE') marksTable = 'Marks_SY_CSE';
        else if (table === 'Students_TY_CSE') marksTable = 'Marks_TY_CSE';
        else if (table === 'Students_BE_CSE') marksTable = 'Marks_BE_CSE';
        const [rows] = await pool.query(`
          SELECT id, semester, academic_year, exam_type, 
                 subject1, subject1_marks, subject1_total,
                 subject2, subject2_marks, subject2_total,
                 subject3, subject3_marks, subject3_total,
                 subject4, subject4_marks, subject4_total,
                 subject5, subject5_marks, subject5_total,
                 total_marks, total_percentage, created_at
          FROM ${marksTable}
          WHERE roll_no = ?
          ORDER BY created_at DESC
        `, [req.user.id]);
        marks = rows;
      } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
        const classes = [
          { table: 'Marks_SY_CSE', studentTable: 'Students_SY_CSE', year: 'SY' },
          { table: 'Marks_TY_CSE', studentTable: 'Students_TY_CSE', year: 'TY' },
          { table: 'Marks_BE_CSE', studentTable: 'Students_BE_CSE', year: 'BE' }
        ];
        for (const cls of classes) {
          const [rows] = await pool.query(`
            SELECT m.id, m.semester, m.academic_year, m.exam_type, 
                   m.subject1, m.subject1_marks, m.subject1_total,
                   m.subject2, m.subject2_marks, m.subject2_total,
                   m.subject3, m.subject3_marks, m.subject3_total,
                   m.subject4, m.subject4_marks, m.subject4_total,
                   m.subject5, m.subject5_marks, m.subject5_total,
                   m.total_marks, m.total_percentage, m.created_at,
                   s.name as student_name, s.roll_no as student_roll_no
            FROM ${cls.table} m
            JOIN ${cls.studentTable} s ON m.student_id = s.roll_no
            ORDER BY CAST(s.roll_no AS UNSIGNED) ASC
          `);
          marks.push(...rows.map(r => ({ ...r, year: cls.year })));
        }
      }
    } catch (e) {}

    // Attendance
    let attendance = [];
    try {
      const { role, table } = req.user;
      if (role === 'student') {
        let attendanceTable = 'Attendance_TY_CSE';
        if (table === 'Students_SY_CSE') attendanceTable = 'Attendance_SY_CSE';
        else if (table === 'Students_TY_CSE') attendanceTable = 'Attendance_TY_CSE';
        else if (table === 'Students_BE_CSE') attendanceTable = 'Attendance_BE_CSE';
        const [rows] = await pool.query(`
          SELECT id, semester, academic_year,
                 subject1_theory, subject1_theory_present, subject1_theory_total,
                 subject1_practical, subject1_practical_present, subject1_practical_total,
                 subject2_theory, subject2_theory_present, subject2_theory_total,
                 subject2_practical, subject2_practical_present, subject2_practical_total,
                 subject3_theory, subject3_theory_present, subject3_theory_total,
                 subject3_practical, subject3_practical_present, subject3_practical_total,
                 subject4_theory, subject4_theory_present, subject4_theory_total,
                 subject4_practical, subject4_practical_present, subject4_practical_total,
                 subject5_theory, subject5_theory_present, subject5_theory_total,
                 subject5_practical, subject5_practical_present, subject5_practical_total,
                 total_present, total_classes, total_percentage, created_at
          FROM ${attendanceTable}
          WHERE roll_no = ?
          ORDER BY created_at DESC
        `, [req.user.id]);
        attendance = rows;
      } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
        const classes = [
          { table: 'Attendance_SY_CSE', studentTable: 'Students_SY_CSE', year: 'SY' },
          { table: 'Attendance_TY_CSE', studentTable: 'Students_TY_CSE', year: 'TY' },
          { table: 'Attendance_BE_CSE', studentTable: 'Students_BE_CSE', year: 'BE' }
        ];
        for (const cls of classes) {
          const [rows] = await pool.query(`
            SELECT a.id, a.semester, a.academic_year,
                   a.subject1_theory, a.subject1_theory_present, a.subject1_theory_total,
                   a.subject1_practical, a.subject1_practical_present, a.subject1_practical_total,
                   a.subject2_theory, a.subject2_theory_present, a.subject2_theory_total,
                   a.subject2_practical, a.subject2_practical_present, a.subject2_practical_total,
                   a.subject3_theory, a.subject3_theory_present, a.subject3_theory_total,
                   a.subject3_practical, a.subject3_practical_present, a.subject3_practical_total,
                   a.subject4_theory, a.subject4_theory_present, a.subject4_theory_total,
                   a.subject4_practical, a.subject4_practical_present, a.subject4_practical_total,
                   a.subject5_theory, a.subject5_theory_present, a.subject5_theory_total,
                   a.subject5_practical, a.subject5_practical_present, a.subject5_practical_total,
                   a.total_present, a.total_classes, a.total_percentage, a.created_at,
                   s.name as student_name, s.roll_no as student_roll_no
            FROM ${cls.table} a
            JOIN ${cls.studentTable} s ON a.student_id = s.roll_no
            ORDER BY CAST(s.roll_no AS UNSIGNED) ASC
          `);
          attendance.push(...rows.map(r => ({ ...r, year: cls.year })));
        }
      }
    } catch (e) {}

    // Fees
    let fees = [];
    try {
      const { role, table } = req.user;
      if (role === 'student') {
        let feesTable = 'Fees_TY_CSE';
        if (table === 'Students_SY_CSE') feesTable = 'Fees_SY_CSE';
        else if (table === 'Students_TY_CSE') feesTable = 'Fees_TY_CSE';
        else if (table === 'Students_BE_CSE') feesTable = 'Fees_BE_CSE';
        const [rows] = await pool.query(`
          SELECT id, semester, academic_year, total_fees, paid_fees, remaining_fees, 
                 last_paid_date, due_date, last_updated, created_at
          FROM ${feesTable}
          WHERE roll_no = ?
          ORDER BY created_at DESC
        `, [req.user.id]);
        fees = rows;
      } else if (role === 'teacher' || role === 'hod' || role === 'principal') {
        const classes = [
          { table: 'Fees_SY_CSE', studentTable: 'Students_SY_CSE', year: 'SY' },
          { table: 'Fees_TY_CSE', studentTable: 'Students_TY_CSE', year: 'TY' },
          { table: 'Fees_BE_CSE', studentTable: 'Students_BE_CSE', year: 'BE' }
        ];
        for (const cls of classes) {
          const [rows] = await pool.query(`
            SELECT f.id, f.semester, f.academic_year, f.total_fees, f.paid_fees, f.remaining_fees, 
                   f.last_paid_date, f.due_date, f.last_updated, f.created_at,
                   s.name as student_name, s.roll_no as student_roll_no
            FROM ${cls.table} f
            JOIN ${cls.studentTable} s ON f.student_id = s.roll_no
            ORDER BY CAST(s.roll_no AS UNSIGNED) ASC
          `);
          fees.push(...rows.map(r => ({ ...r, year: cls.year })));
        }
      }
    } catch (e) {}

    return res.json({ notifications, events, marks, attendance, fees });
  } catch (error) {
    return res.status(500).json({ msg: 'Server error' });
  }
}

module.exports = { getNotifications, getEvents, registerForEvent, getMarks, getAttendance, getFees, updateMarks, updateAttendance, updateFees, getAllStudentServicesData };
