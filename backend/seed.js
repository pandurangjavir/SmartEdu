const { pool } = require("./config/db");
const bcrypt = require("bcrypt");

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);

    // ----------------------------
    // Students TY
    // ----------------------------
    const ty1Pass = await bcrypt.hash("9000000101", salt);
    const ty2Pass = await bcrypt.hash("9000000102", salt);

    await pool.execute(
      `INSERT INTO Students_TY_CSE (roll_no, name, email, contact, username, password, admission_year)
       VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)`,
      [
        1, "Sita", "sita@tycse.com", "9000000101", "sita@tycse.com", ty1Pass, 2022,
        2, "Gopal", "gopal@tycse.com", "9000000102", "gopal@tycse.com", ty2Pass, 2022
      ]
    );

    // ----------------------------
    // Students BE
    // ----------------------------
    const be1Pass = await bcrypt.hash("9000000201", salt);
    const be2Pass = await bcrypt.hash("9000000202", salt);

    await pool.execute(
      `INSERT INTO Students_BE_CSE (roll_no, name, email, contact, username, password, admission_year)
       VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)`,
      [
        1, "Asha", "asha@becse.com", "9000000201", "asha@becse.com", be1Pass, 2021,
        2, "Kiran", "kiran@becse.com", "9000000202", "kiran@becse.com", be2Pass, 2021
      ]
    );

    // ----------------------------
    // Events
    // ----------------------------
    await pool.execute(
      `INSERT INTO Events_CSE (branch, title, description, event_date, registration_link)
       VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
      [
        "CSE", "TechFest 2025", "National Level Hackathon", "2025-09-20", "http://register.techfest.com",
        "CSE", "Sports Meet", "Annual sports competition", "2025-09-25", null
      ]
    );

    // ----------------------------
    // Fees (SY, TY, BE demo)
    // ----------------------------
    await pool.execute(
      `INSERT INTO Fees_SY_CSE (roll_no, year, amount, status)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)`,
      [
        1, "SY", 50000.00, "Pending",  // Arjun Reddy
        2, "SY", 50000.00, "Paid",     // Kavya Nair
        3, "SY", 50000.00, "Pending"   // Rohit Gupta
      ]
    );

    await pool.execute(
      `INSERT INTO Fees_TY_CSE (roll_no, year, amount, status)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
      [
        1, "TY", 52000.00, "Paid",     // Sita
        2, "TY", 52000.00, "Pending"   // Gopal
      ]
    );

    await pool.execute(
      `INSERT INTO Fees_BE_CSE (roll_no, year, amount, status)
       VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
      [
        1, "BE", 55000.00, "Pending",  // Asha
        2, "BE", 55000.00, "Paid"      // Kiran
      ]
    );


    console.log("✅ Demo data inserted successfully with bcrypt hashed passwords");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
