// Migration: Add Unique_ID column to USERS table
const pool = require('./db');

async function migrate() {
    try {
        // Check if column already exists
        const [columns] = await pool.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gym_management' AND TABLE_NAME = 'USERS' AND COLUMN_NAME = 'Unique_ID'"
        );

        if (columns.length > 0) {
            console.log('✅ Unique_ID column already exists. No migration needed.');
        } else {
            await pool.query('ALTER TABLE USERS ADD COLUMN Unique_ID VARCHAR(12) UNIQUE AFTER User_ID');
            console.log('✅ Successfully added Unique_ID column to USERS table.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
