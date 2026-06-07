/**
 * Migration: Simplify auth — add Password column, make Access_Key optional
 * Run once: node migrate_simple_auth.js
 */
const pool = require('./db');

async function migrate() {
    try {
        console.log('🔄 Running Simple Auth Migration...\n');

        // 1. Add Password column to STAFF table if it doesn't exist
        const [cols] = await pool.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'STAFF' AND COLUMN_NAME = 'Password'`
        );

        if (cols.length > 0) {
            console.log('✅ Password column already exists.');
        } else {
            await pool.query('ALTER TABLE STAFF ADD COLUMN Password VARCHAR(255) NULL');
            console.log('✅ Password column added to STAFF table.');
        }

        // 2. Make Access_Key nullable (so new staff registered via login don't need one)
        try {
            await pool.query('ALTER TABLE STAFF MODIFY COLUMN Access_Key VARCHAR(20) NULL');
            console.log('✅ Access_Key column is now nullable.');
        } catch (e) {
            // Column might not exist or already nullable
            console.log('ℹ️  Access_Key column update skipped:', e.message);
        }

        // 3. Drop unique constraint on Access_Key if it exists
        try {
            const [indexes] = await pool.query(
                `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'STAFF' AND COLUMN_NAME = 'Access_Key' AND NON_UNIQUE = 0`
            );
            for (const idx of indexes) {
                if (idx.INDEX_NAME !== 'PRIMARY') {
                    await pool.query(`ALTER TABLE STAFF DROP INDEX ${idx.INDEX_NAME}`);
                    console.log(`✅ Dropped unique index: ${idx.INDEX_NAME}`);
                }
            }
        } catch (e) {
            console.log('ℹ️  Index cleanup skipped:', e.message);
        }

        console.log('\n🎉 Migration complete! Staff can now register with name + password.\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
