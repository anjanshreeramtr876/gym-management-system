// Migration: Create DIET_PLAN table
const pool = require('./db');

async function migrate() {
    try {
        const [tables] = await pool.query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'gym_management' AND TABLE_NAME = 'DIET_PLAN'"
        );

        if (tables.length > 0) {
            console.log('✅ DIET_PLAN table already exists. No migration needed.');
        } else {
            await pool.query(`
                CREATE TABLE DIET_PLAN (
                    Plan_ID INT AUTO_INCREMENT PRIMARY KEY,
                    Member_ID INT NOT NULL,
                    Trainer_ID INT NOT NULL,
                    Plan_Name VARCHAR(100) NOT NULL,
                    Goal VARCHAR(100),
                    Breakfast TEXT,
                    Lunch TEXT,
                    Dinner TEXT,
                    Snacks TEXT,
                    Notes TEXT,
                    Created_At DATE,
                    FOREIGN KEY (Member_ID) REFERENCES MEMBER(Member_ID) ON DELETE CASCADE ON UPDATE CASCADE,
                    FOREIGN KEY (Trainer_ID) REFERENCES TRAINER(Trainer_ID) ON DELETE CASCADE ON UPDATE CASCADE
                )
            `);
            console.log('✅ Successfully created DIET_PLAN table.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
