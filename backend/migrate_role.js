const pool = require('./db');

(async () => {
    try {
        await pool.query("ALTER TABLE USERS ADD COLUMN Role ENUM('admin','member') DEFAULT 'member' AFTER Password");
        console.log('SUCCESS: Role column added to USERS table');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('OK: Role column already exists');
        } else {
            console.error('ERROR:', e.message);
        }
    }
    process.exit(0);
})();
