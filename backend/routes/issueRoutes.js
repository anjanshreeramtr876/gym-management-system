const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all issue reports (admin view – includes staff name)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.*, s.Staff_Name 
             FROM ISSUE_REPORT r 
             LEFT JOIN STAFF s ON r.Staff_ID = s.Staff_ID 
             ORDER BY 
                CASE r.Priority 
                    WHEN 'critical' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'medium' THEN 3 
                    WHEN 'low' THEN 4 
                END,
                r.Created_At DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET reports by staff ID (staff view)
router.get('/staff/:staffId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.*, s.Staff_Name 
             FROM ISSUE_REPORT r 
             LEFT JOIN STAFF s ON r.Staff_ID = s.Staff_ID 
             WHERE r.Staff_ID = ? 
             ORDER BY r.Created_At DESC`,
            [req.params.staffId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET report stats
router.get('/stats/summary', async (req, res) => {
    try {
        const [total] = await pool.query('SELECT COUNT(*) AS total FROM ISSUE_REPORT');
        const [open] = await pool.query("SELECT COUNT(*) AS total FROM ISSUE_REPORT WHERE Status = 'open'");
        const [inProgress] = await pool.query("SELECT COUNT(*) AS total FROM ISSUE_REPORT WHERE Status = 'in_progress'");
        const [resolved] = await pool.query("SELECT COUNT(*) AS total FROM ISSUE_REPORT WHERE Status = 'resolved'");
        const [byType] = await pool.query(
            'SELECT Report_Type, COUNT(*) AS count FROM ISSUE_REPORT GROUP BY Report_Type'
        );

        res.json({
            total: total[0].total,
            open: open[0].total,
            in_progress: inProgress[0].total,
            resolved: resolved[0].total,
            by_type: byType
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single report
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.*, s.Staff_Name 
             FROM ISSUE_REPORT r 
             LEFT JOIN STAFF s ON r.Staff_ID = s.Staff_ID 
             WHERE r.Report_ID = ?`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Report not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create report (staff submits)
router.post('/', async (req, res) => {
    try {
        const { Staff_ID, Report_Type, Title, Description, Priority } = req.body;

        if (!Staff_ID || !Report_Type || !Title || !Description) {
            return res.status(400).json({ error: 'Staff ID, Report Type, Title, and Description are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO ISSUE_REPORT (Staff_ID, Report_Type, Title, Description, Priority) VALUES (?, ?, ?, ?, ?)',
            [Staff_ID, Report_Type, Title, Description, Priority || 'medium']
        );

        res.status(201).json({ id: result.insertId, message: 'Issue report submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update report status + admin response
router.put('/:id', async (req, res) => {
    try {
        const { Status, Admin_Response } = req.body;
        const [result] = await pool.query(
            'UPDATE ISSUE_REPORT SET Status=?, Admin_Response=? WHERE Report_ID=?',
            [Status, Admin_Response || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Report not found' });
        res.json({ message: 'Report updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE report
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM ISSUE_REPORT WHERE Report_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Report not found' });
        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
