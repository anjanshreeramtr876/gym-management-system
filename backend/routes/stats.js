const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET dashboard statistics
router.get('/', async (req, res) => {
    try {
        // Run all queries in parallel for performance
        const [
            [memberCount],
            [trainerCount],
            [paymentStats],
            [staffCount],
            [openIssues],
            [recentMembers]
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) AS total FROM MEMBER'),
            pool.query('SELECT COUNT(*) AS total FROM TRAINER'),
            pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(Amount), 0) AS revenue FROM PAYMENT'),
            pool.query('SELECT COUNT(*) AS total FROM STAFF WHERE Is_Active = 1'),
            pool.query("SELECT COUNT(*) AS total FROM ISSUE_REPORT WHERE Status IN ('open', 'in_progress')"),
            pool.query(
                `SELECT m.*, t.Trainer_Name 
                 FROM MEMBER m 
                 LEFT JOIN TRAINER t ON m.Trainer_ID = t.Trainer_ID 
                 ORDER BY m.Member_ID DESC 
                 LIMIT 5`
            )
        ]);

        res.json({
            totalMembers: memberCount[0].total,
            totalTrainers: trainerCount[0].total,
            totalPayments: paymentStats[0].total,
            totalRevenue: paymentStats[0].revenue,
            totalStaff: staffCount[0].total,
            openIssues: openIssues[0].total,
            recentMembers: recentMembers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
