-- SmartEdu Database Schema
-- Complete database structure for College ERP + AI Chatbot System

-- =============================================
-- USERS & AUTHENTICATION TABLES
-- =============================================

-- Principal table
CREATE TABLE IF NOT EXISTS Principal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(15) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- HODs table (one per branch)
CREATE TABLE IF NOT EXISTS HODs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(15) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    branch VARCHAR(10) NOT NULL DEFAULT 'CSE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teachers table (CSE branch)
CREATE TABLE IF NOT EXISTS Teachers_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(15) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students tables (separate for each year)
CREATE TABLE IF NOT EXISTS Students_SY_CSE (
    roll_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(15) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    admission_year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Students_TY_CSE (
    roll_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(15) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    admission_year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Students_BE_CSE (
    roll_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(15) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    admission_year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- ACADEMIC DATA TABLES
-- =============================================

-- Marks tables (separate for each year)
CREATE TABLE IF NOT EXISTS Marks_SY_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    subject1 VARCHAR(100),
    subject1_marks INT DEFAULT 0,
    subject1_total INT DEFAULT 100,
    subject2 VARCHAR(100),
    subject2_marks INT DEFAULT 0,
    subject2_total INT DEFAULT 100,
    subject3 VARCHAR(100),
    subject3_marks INT DEFAULT 0,
    subject3_total INT DEFAULT 100,
    subject4 VARCHAR(100),
    subject4_marks INT DEFAULT 0,
    subject4_total INT DEFAULT 100,
    subject5 VARCHAR(100),
    subject5_marks INT DEFAULT 0,
    subject5_total INT DEFAULT 100,
    total_marks INT DEFAULT 0,
    total_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_SY_CSE(roll_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Marks_TY_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    subject1 VARCHAR(100),
    subject1_marks INT DEFAULT 0,
    subject1_total INT DEFAULT 100,
    subject2 VARCHAR(100),
    subject2_marks INT DEFAULT 0,
    subject2_total INT DEFAULT 100,
    subject3 VARCHAR(100),
    subject3_marks INT DEFAULT 0,
    subject3_total INT DEFAULT 100,
    subject4 VARCHAR(100),
    subject4_marks INT DEFAULT 0,
    subject4_total INT DEFAULT 100,
    subject5 VARCHAR(100),
    subject5_marks INT DEFAULT 0,
    subject5_total INT DEFAULT 100,
    total_marks INT DEFAULT 0,
    total_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_TY_CSE(roll_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Marks_BE_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    subject1 VARCHAR(100),
    subject1_marks INT DEFAULT 0,
    subject1_total INT DEFAULT 100,
    subject2 VARCHAR(100),
    subject2_marks INT DEFAULT 0,
    subject2_total INT DEFAULT 100,
    subject3 VARCHAR(100),
    subject3_marks INT DEFAULT 0,
    subject3_total INT DEFAULT 100,
    subject4 VARCHAR(100),
    subject4_marks INT DEFAULT 0,
    subject4_total INT DEFAULT 100,
    subject5 VARCHAR(100),
    subject5_marks INT DEFAULT 0,
    subject5_total INT DEFAULT 100,
    total_marks INT DEFAULT 0,
    total_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_BE_CSE(roll_no) ON DELETE CASCADE
);

-- Attendance tables (separate for each year)
CREATE TABLE IF NOT EXISTS Attendance_SY_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    subject1_theory VARCHAR(100),
    subject1_theory_present INT DEFAULT 0,
    subject1_theory_total INT DEFAULT 50,
    subject1_practical VARCHAR(100),
    subject1_practical_present INT DEFAULT 0,
    subject1_practical_total INT DEFAULT 25,
    subject2_theory VARCHAR(100),
    subject2_theory_present INT DEFAULT 0,
    subject2_theory_total INT DEFAULT 50,
    subject2_practical VARCHAR(100),
    subject2_practical_present INT DEFAULT 0,
    subject2_practical_total INT DEFAULT 25,
    subject3_theory VARCHAR(100),
    subject3_theory_present INT DEFAULT 0,
    subject3_theory_total INT DEFAULT 50,
    subject3_practical VARCHAR(100),
    subject3_practical_present INT DEFAULT 0,
    subject3_practical_total INT DEFAULT 25,
    subject4_theory VARCHAR(100),
    subject4_theory_present INT DEFAULT 0,
    subject4_theory_total INT DEFAULT 50,
    subject4_practical VARCHAR(100),
    subject4_practical_present INT DEFAULT 0,
    subject4_practical_total INT DEFAULT 25,
    subject5_theory VARCHAR(100),
    subject5_theory_present INT DEFAULT 0,
    subject5_theory_total INT DEFAULT 50,
    subject5_practical VARCHAR(100),
    subject5_practical_present INT DEFAULT 0,
    subject5_practical_total INT DEFAULT 25,
    total_present INT DEFAULT 0,
    total_classes INT DEFAULT 325,
    total_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_SY_CSE(roll_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Attendance_TY_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    subject1_theory VARCHAR(100),
    subject1_theory_present INT DEFAULT 0,
    subject1_theory_total INT DEFAULT 50,
    subject1_practical VARCHAR(100),
    subject1_practical_present INT DEFAULT 0,
    subject1_practical_total INT DEFAULT 25,
    subject2_theory VARCHAR(100),
    subject2_theory_present INT DEFAULT 0,
    subject2_theory_total INT DEFAULT 50,
    subject2_practical VARCHAR(100),
    subject2_practical_present INT DEFAULT 0,
    subject2_practical_total INT DEFAULT 25,
    subject3_theory VARCHAR(100),
    subject3_theory_present INT DEFAULT 0,
    subject3_theory_total INT DEFAULT 50,
    subject3_practical VARCHAR(100),
    subject3_practical_present INT DEFAULT 0,
    subject3_practical_total INT DEFAULT 25,
    subject4_theory VARCHAR(100),
    subject4_theory_present INT DEFAULT 0,
    subject4_theory_total INT DEFAULT 50,
    subject4_practical VARCHAR(100),
    subject4_practical_present INT DEFAULT 0,
    subject4_practical_total INT DEFAULT 25,
    subject5_theory VARCHAR(100),
    subject5_theory_present INT DEFAULT 0,
    subject5_theory_total INT DEFAULT 50,
    subject5_practical VARCHAR(100),
    subject5_practical_present INT DEFAULT 0,
    subject5_practical_total INT DEFAULT 25,
    total_present INT DEFAULT 0,
    total_classes INT DEFAULT 325,
    total_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_TY_CSE(roll_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Attendance_BE_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    subject1_theory VARCHAR(100),
    subject1_theory_present INT DEFAULT 0,
    subject1_theory_total INT DEFAULT 50,
    subject1_practical VARCHAR(100),
    subject1_practical_present INT DEFAULT 0,
    subject1_practical_total INT DEFAULT 25,
    subject2_theory VARCHAR(100),
    subject2_theory_present INT DEFAULT 0,
    subject2_theory_total INT DEFAULT 50,
    subject2_practical VARCHAR(100),
    subject2_practical_present INT DEFAULT 0,
    subject2_practical_total INT DEFAULT 25,
    subject3_theory VARCHAR(100),
    subject3_theory_present INT DEFAULT 0,
    subject3_theory_total INT DEFAULT 50,
    subject3_practical VARCHAR(100),
    subject3_practical_present INT DEFAULT 0,
    subject3_practical_total INT DEFAULT 25,
    subject4_theory VARCHAR(100),
    subject4_theory_present INT DEFAULT 0,
    subject4_theory_total INT DEFAULT 50,
    subject4_practical VARCHAR(100),
    subject4_practical_present INT DEFAULT 0,
    subject4_practical_total INT DEFAULT 25,
    subject5_theory VARCHAR(100),
    subject5_theory_present INT DEFAULT 0,
    subject5_theory_total INT DEFAULT 50,
    subject5_practical VARCHAR(100),
    subject5_practical_present INT DEFAULT 0,
    subject5_practical_total INT DEFAULT 25,
    total_present INT DEFAULT 0,
    total_classes INT DEFAULT 325,
    total_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_BE_CSE(roll_no) ON DELETE CASCADE
);

-- Fees tables (separate for each year)
CREATE TABLE IF NOT EXISTS Fees_SY_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    total_fees DECIMAL(10,2) NOT NULL,
    paid_fees DECIMAL(10,2) DEFAULT 0.00,
    remaining_fees DECIMAL(10,2) NOT NULL,
    last_paid_date DATE,
    due_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_SY_CSE(roll_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Fees_TY_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    total_fees DECIMAL(10,2) NOT NULL,
    paid_fees DECIMAL(10,2) DEFAULT 0.00,
    remaining_fees DECIMAL(10,2) NOT NULL,
    last_paid_date DATE,
    due_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_TY_CSE(roll_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Fees_BE_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    total_fees DECIMAL(10,2) NOT NULL,
    paid_fees DECIMAL(10,2) DEFAULT 0.00,
    remaining_fees DECIMAL(10,2) NOT NULL,
    last_paid_date DATE,
    due_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roll_no) REFERENCES Students_BE_CSE(roll_no) ON DELETE CASCADE
);

-- =============================================
-- COMMUNICATION TABLES
-- =============================================

-- Notifications table (branch-specific)
CREATE TABLE IF NOT EXISTS Notifications_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('exam', 'project', 'event', 'academic', 'general') NOT NULL,
    target_audience ENUM('all', 'students', 'teachers', 'hod') NOT NULL,
    target_year ENUM('SY', 'TY', 'BE', 'all') DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES HODs(id) ON DELETE CASCADE
);

-- Events table (branch-specific)
CREATE TABLE IF NOT EXISTS Events_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    registration_link VARCHAR(500),
    branch VARCHAR(10) DEFAULT 'CSE',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES HODs(id) ON DELETE CASCADE
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS Event_Registrations_CSE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    student_table VARCHAR(50) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Events_CSE(id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for students tables
CREATE INDEX idx_students_sy_roll_no ON Students_SY_CSE(roll_no);
CREATE INDEX idx_students_ty_roll_no ON Students_TY_CSE(roll_no);
CREATE INDEX idx_students_be_roll_no ON Students_BE_CSE(roll_no);

-- Indexes for marks tables
CREATE INDEX idx_marks_sy_roll_no ON Marks_SY_CSE(roll_no);
CREATE INDEX idx_marks_ty_roll_no ON Marks_TY_CSE(roll_no);
CREATE INDEX idx_marks_be_roll_no ON Marks_BE_CSE(roll_no);

-- Indexes for attendance tables
CREATE INDEX idx_attendance_sy_roll_no ON Attendance_SY_CSE(roll_no);
CREATE INDEX idx_attendance_ty_roll_no ON Attendance_TY_CSE(roll_no);
CREATE INDEX idx_attendance_be_roll_no ON Attendance_BE_CSE(roll_no);

-- Indexes for fees tables
CREATE INDEX idx_fees_sy_roll_no ON Fees_SY_CSE(roll_no);
CREATE INDEX idx_fees_ty_roll_no ON Fees_TY_CSE(roll_no);
CREATE INDEX idx_fees_be_roll_no ON Fees_BE_CSE(roll_no);

-- Indexes for notifications
CREATE INDEX idx_notifications_target ON Notifications_CSE(target_audience, target_year);
CREATE INDEX idx_notifications_active ON Notifications_CSE(is_active);

-- Indexes for events
CREATE INDEX idx_events_date ON Events_CSE(event_date);
CREATE INDEX idx_events_branch ON Events_CSE(branch);

-- Indexes for event registrations
CREATE INDEX idx_event_registrations_event ON Event_Registrations_CSE(event_id);
CREATE INDEX idx_event_registrations_student ON Event_Registrations_CSE(student_id, student_table);

-- =============================================
-- BRANCH REPLICATION (ENTC, CIVIL, MECH, ELECTRICAL)
-- Clone CSE tables for other branches to keep structure identical
-- Note: This uses CREATE TABLE ... LIKE to mirror schema. Adjust FKs/indexes as needed.
-- =============================================

-- Helper note: Run this whole file once to ensure all branch tables exist

-- ============ ENTC ============
CREATE TABLE IF NOT EXISTS Teachers_ENTC LIKE Teachers_CSE;
CREATE TABLE IF NOT EXISTS Students_SY_ENTC LIKE Students_SY_CSE;
CREATE TABLE IF NOT EXISTS Students_TY_ENTC LIKE Students_TY_CSE;
CREATE TABLE IF NOT EXISTS Students_BE_ENTC LIKE Students_BE_CSE;
CREATE TABLE IF NOT EXISTS Marks_SY_ENTC LIKE Marks_SY_CSE;
CREATE TABLE IF NOT EXISTS Marks_TY_ENTC LIKE Marks_TY_CSE;
CREATE TABLE IF NOT EXISTS Marks_BE_ENTC LIKE Marks_BE_CSE;
CREATE TABLE IF NOT EXISTS Attendance_SY_ENTC LIKE Attendance_SY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_TY_ENTC LIKE Attendance_TY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_BE_ENTC LIKE Attendance_BE_CSE;
CREATE TABLE IF NOT EXISTS Fees_SY_ENTC LIKE Fees_SY_CSE;
CREATE TABLE IF NOT EXISTS Fees_TY_ENTC LIKE Fees_TY_CSE;
CREATE TABLE IF NOT EXISTS Fees_BE_ENTC LIKE Fees_BE_CSE;
CREATE TABLE IF NOT EXISTS Notifications_ENTC LIKE Notifications_CSE;
CREATE TABLE IF NOT EXISTS Events_ENTC LIKE Events_CSE;
CREATE TABLE IF NOT EXISTS Event_Registrations_ENTC LIKE Event_Registrations_CSE;
ALTER TABLE Events_ENTC MODIFY branch VARCHAR(10) DEFAULT 'ENTC';

-- ============ CIVIL ============
CREATE TABLE IF NOT EXISTS Teachers_CIVIL LIKE Teachers_CSE;
CREATE TABLE IF NOT EXISTS Students_SY_CIVIL LIKE Students_SY_CSE;
CREATE TABLE IF NOT EXISTS Students_TY_CIVIL LIKE Students_TY_CSE;
CREATE TABLE IF NOT EXISTS Students_BE_CIVIL LIKE Students_BE_CSE;
CREATE TABLE IF NOT EXISTS Marks_SY_CIVIL LIKE Marks_SY_CSE;
CREATE TABLE IF NOT EXISTS Marks_TY_CIVIL LIKE Marks_TY_CSE;
CREATE TABLE IF NOT EXISTS Marks_BE_CIVIL LIKE Marks_BE_CSE;
CREATE TABLE IF NOT EXISTS Attendance_SY_CIVIL LIKE Attendance_SY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_TY_CIVIL LIKE Attendance_TY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_BE_CIVIL LIKE Attendance_BE_CSE;
CREATE TABLE IF NOT EXISTS Fees_SY_CIVIL LIKE Fees_SY_CSE;
CREATE TABLE IF NOT EXISTS Fees_TY_CIVIL LIKE Fees_TY_CSE;
CREATE TABLE IF NOT EXISTS Fees_BE_CIVIL LIKE Fees_BE_CSE;
CREATE TABLE IF NOT EXISTS Notifications_CIVIL LIKE Notifications_CSE;
CREATE TABLE IF NOT EXISTS Events_CIVIL LIKE Events_CSE;
CREATE TABLE IF NOT EXISTS Event_Registrations_CIVIL LIKE Event_Registrations_CSE;
ALTER TABLE Events_CIVIL MODIFY branch VARCHAR(10) DEFAULT 'CIVIL';

-- ============ MECH ============
CREATE TABLE IF NOT EXISTS Teachers_MECH LIKE Teachers_CSE;
CREATE TABLE IF NOT EXISTS Students_SY_MECH LIKE Students_SY_CSE;
CREATE TABLE IF NOT EXISTS Students_TY_MECH LIKE Students_TY_CSE;
CREATE TABLE IF NOT EXISTS Students_BE_MECH LIKE Students_BE_CSE;
CREATE TABLE IF NOT EXISTS Marks_SY_MECH LIKE Marks_SY_CSE;
CREATE TABLE IF NOT EXISTS Marks_TY_MECH LIKE Marks_TY_CSE;
CREATE TABLE IF NOT EXISTS Marks_BE_MECH LIKE Marks_BE_CSE;
CREATE TABLE IF NOT EXISTS Attendance_SY_MECH LIKE Attendance_SY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_TY_MECH LIKE Attendance_TY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_BE_MECH LIKE Attendance_BE_CSE;
CREATE TABLE IF NOT EXISTS Fees_SY_MECH LIKE Fees_SY_CSE;
CREATE TABLE IF NOT EXISTS Fees_TY_MECH LIKE Fees_TY_CSE;
CREATE TABLE IF NOT EXISTS Fees_BE_MECH LIKE Fees_BE_CSE;
CREATE TABLE IF NOT EXISTS Notifications_MECH LIKE Notifications_CSE;
CREATE TABLE IF NOT EXISTS Events_MECH LIKE Events_CSE;
CREATE TABLE IF NOT EXISTS Event_Registrations_MECH LIKE Event_Registrations_CSE;
ALTER TABLE Events_MECH MODIFY branch VARCHAR(10) DEFAULT 'MECH';

-- ============ ELECTRICAL ============
CREATE TABLE IF NOT EXISTS Teachers_ELECTRICAL LIKE Teachers_CSE;
CREATE TABLE IF NOT EXISTS Students_SY_ELECTRICAL LIKE Students_SY_CSE;
CREATE TABLE IF NOT EXISTS Students_TY_ELECTRICAL LIKE Students_TY_CSE;
CREATE TABLE IF NOT EXISTS Students_BE_ELECTRICAL LIKE Students_BE_CSE;
CREATE TABLE IF NOT EXISTS Marks_SY_ELECTRICAL LIKE Marks_SY_CSE;
CREATE TABLE IF NOT EXISTS Marks_TY_ELECTRICAL LIKE Marks_TY_CSE;
CREATE TABLE IF NOT EXISTS Marks_BE_ELECTRICAL LIKE Marks_BE_CSE;
CREATE TABLE IF NOT EXISTS Attendance_SY_ELECTRICAL LIKE Attendance_SY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_TY_ELECTRICAL LIKE Attendance_TY_CSE;
CREATE TABLE IF NOT EXISTS Attendance_BE_ELECTRICAL LIKE Attendance_BE_CSE;
CREATE TABLE IF NOT EXISTS Fees_SY_ELECTRICAL LIKE Fees_SY_CSE;
CREATE TABLE IF NOT EXISTS Fees_TY_ELECTRICAL LIKE Fees_TY_CSE;
CREATE TABLE IF NOT EXISTS Fees_BE_ELECTRICAL LIKE Fees_BE_CSE;
CREATE TABLE IF NOT EXISTS Notifications_ELECTRICAL LIKE Notifications_CSE;
CREATE TABLE IF NOT EXISTS Events_ELECTRICAL LIKE Events_CSE;
CREATE TABLE IF NOT EXISTS Event_Registrations_ELECTRICAL LIKE Event_Registrations_CSE;
ALTER TABLE Events_ELECTRICAL MODIFY branch VARCHAR(10) DEFAULT 'ELECTRICAL';