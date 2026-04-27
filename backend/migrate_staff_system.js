const pool = require('./db');

async function migrate() {
    try {
        console.log('🔄 Running Staff System Migration...\n');

        // 1. STAFF table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS STAFF (
                Staff_ID INT AUTO_INCREMENT PRIMARY KEY,
                Staff_Name VARCHAR(100) NOT NULL,
                Email VARCHAR(100),
                Phone VARCHAR(20),
                Role VARCHAR(50) DEFAULT 'staff',
                Access_Key VARCHAR(20) NOT NULL UNIQUE,
                Is_Active TINYINT(1) DEFAULT 1,
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ STAFF table created');

        // 2. EXPENDITURE table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS EXPENDITURE (
                Expenditure_ID INT AUTO_INCREMENT PRIMARY KEY,
                Category VARCHAR(100) NOT NULL,
                Description TEXT,
                Amount DECIMAL(10, 2) NOT NULL,
                Expenditure_Date DATE NOT NULL,
                Added_By VARCHAR(100) DEFAULT 'admin',
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ EXPENDITURE table created');

        // 3. ISSUE_REPORT table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ISSUE_REPORT (
                Report_ID INT AUTO_INCREMENT PRIMARY KEY,
                Staff_ID INT NOT NULL,
                Report_Type ENUM('member_feedback', 'equipment_shortage', 'equipment_damage', 'other') NOT NULL,
                Title VARCHAR(200) NOT NULL,
                Description TEXT NOT NULL,
                Priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                Status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
                Admin_Response TEXT,
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (Staff_ID) REFERENCES STAFF(Staff_ID) ON DELETE CASCADE
            )
        `);
        console.log('✅ ISSUE_REPORT table created');

        console.log('\n🎉 Migration complete! All tables ready.\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
