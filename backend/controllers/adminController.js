const { pool } = require('../config/db');

// Get all users across all tables
async function getAllUsers(req, res) {
  try {
    const { search, role } = req.query;
    
    let users = [];
    
    // Get students from all year tables
    const studentTables = ['Students_SY_CSE', 'Students_TY_CSE', 'Students_BE_CSE'];
    for (const table of studentTables) {
      const [rows] = await pool.query(`SELECT roll_no as id, name, email, contact, username, 'student' as role, admission_year as year FROM ${table}`);
      users.push(...rows);
    }
    
    // Get teachers
    const [teachers] = await pool.query(`SELECT id, name, email, contact, username, 'teacher' as role, department FROM Teachers_CSE`);
    users.push(...teachers);
    
    // Get HODs
    const [hods] = await pool.query(`SELECT id, name, email, contact, username, 'hod' as role, department FROM HODs`);
    users.push(...hods);
    
    // Get Principal
    const [principal] = await pool.query(`SELECT id, name, email, contact, username, 'principal' as role FROM Principal`);
    users.push(...principal);
    
    // Filter by search term
    if (search) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by role
    if (role) {
      users = users.filter(user => user.role === role.toLowerCase());
    }
    
    return res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

// Get admin statistics
async function getStats(req, res) {
  try {
    const stats = {};
    
    // Count students by year
    const [syCount] = await pool.query('SELECT COUNT(*) as count FROM Students_SY_CSE');
    const [tyCount] = await pool.query('SELECT COUNT(*) as count FROM Students_TY_CSE');
    const [beCount] = await pool.query('SELECT COUNT(*) as count FROM Students_BE_CSE');
    
    stats.students = {
      SY: syCount[0].count,
      TY: tyCount[0].count,
      BE: beCount[0].count,
      total: syCount[0].count + tyCount[0].count + beCount[0].count
    };
    
    // Count teachers
    const [teacherCount] = await pool.query('SELECT COUNT(*) as count FROM Teachers_CSE');
    stats.teachers = teacherCount[0].count;
    
    // Count HODs
    const [hodCount] = await pool.query('SELECT COUNT(*) as count FROM HODs');
    stats.hods = hodCount[0].count;
    
    // Count events
    const [eventCount] = await pool.query('SELECT COUNT(*) as count FROM Events_CSE');
    stats.events = eventCount[0].count;
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
}

module.exports = { getAllUsers, getStats };
