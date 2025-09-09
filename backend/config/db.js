const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Expected users table schema reference:
// CREATE TABLE IF NOT EXISTS users (
// 	id INT AUTO_INCREMENT PRIMARY KEY,
// 	username VARCHAR(100) NOT NULL,
// 	password_hash VARCHAR(255) NOT NULL,
// 	role ENUM('principal','hod','teacher','student') NOT NULL,
// 	year ENUM('SY','TY','BE') NULL,
// 	UNIQUE KEY unique_user (username, role, year)
// );

const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'smartedu',
	port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

async function testConnection() {
	try {
		const [rows] = await pool.query('SELECT 1 + 1 AS result');
		return rows[0].result === 2;
	} catch (error) {
		console.error('MySQL connection test failed:', error.message);
		return false;
	}
}

module.exports = { pool, testConnection };
