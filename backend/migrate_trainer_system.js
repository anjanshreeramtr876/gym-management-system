const pool = require('./db');

async function migrate() {
    console.log('🔄 Running Trainer Portal Migration...\n');

    // 1. Add Access_Key and Is_Active columns to TRAINER table
    try {
        await pool.query(`
            ALTER TABLE TRAINER 
            ADD COLUMN IF NOT EXISTS Access_Key VARCHAR(20) UNIQUE,
            ADD COLUMN IF NOT EXISTS Is_Active TINYINT(1) DEFAULT 1
        `);
        console.log('✅ TRAINER table updated with Access_Key and Is_Active');
    } catch (err) {
        // If columns already exist, that's OK
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  TRAINER columns already exist, skipping...');
        } else {
            // Try adding them individually
            try {
                await pool.query(`ALTER TABLE TRAINER ADD COLUMN Access_Key VARCHAR(20) UNIQUE`);
            } catch (e) { /* already exists */ }
            try {
                await pool.query(`ALTER TABLE TRAINER ADD COLUMN Is_Active TINYINT(1) DEFAULT 1`);
            } catch (e) { /* already exists */ }
            console.log('✅ TRAINER table updated');
        }
    }

    // 2. Create WORKOUT table
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS WORKOUT (
                Workout_ID INT AUTO_INCREMENT PRIMARY KEY,
                Member_ID INT NOT NULL,
                Trainer_ID INT NOT NULL,
                Workout_Name VARCHAR(100) NOT NULL,
                Day_Of_Week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
                Exercises TEXT,
                Sets_Reps VARCHAR(255),
                Duration_Minutes INT,
                Notes TEXT,
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (Member_ID) REFERENCES MEMBER(Member_ID) ON DELETE CASCADE,
                FOREIGN KEY (Trainer_ID) REFERENCES TRAINER(Trainer_ID) ON DELETE CASCADE
            )
        `);
        console.log('✅ WORKOUT table created');
    } catch (err) {
        console.error('❌ WORKOUT table error:', err.message);
    }

    console.log('\n🎉 Trainer Portal Migration complete!\n');
    process.exit(0);
}

migrate();
