const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all expenditures
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM EXPENDITURE ORDER BY Expenditure_Date DESC, Expenditure_ID DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET expenditure summary/stats
router.get('/summary', async (req, res) => {
    try {
        const [totalResult] = await pool.query(
            'SELECT COALESCE(SUM(Amount), 0) AS total_expenditure, COUNT(*) AS total_entries FROM EXPENDITURE'
        );

        const [byCategory] = await pool.query(
            `SELECT Category, COALESCE(SUM(Amount), 0) AS total, COUNT(*) AS count 
             FROM EXPENDITURE 
             GROUP BY Category 
             ORDER BY total DESC`
        );

        const [monthlyData] = await pool.query(
            `SELECT DATE_FORMAT(Expenditure_Date, '%Y-%m') AS month, 
                    COALESCE(SUM(Amount), 0) AS total 
             FROM EXPENDITURE 
             GROUP BY month 
             ORDER BY month DESC 
             LIMIT 12`
        );

        // Get total revenue for profit/loss calc
        const [revenueResult] = await pool.query(
            'SELECT COALESCE(SUM(Amount), 0) AS total_revenue FROM PAYMENT'
        );

        res.json({
            total_expenditure: totalResult[0].total_expenditure,
            total_entries: totalResult[0].total_entries,
            total_revenue: revenueResult[0].total_revenue,
            net_profit: revenueResult[0].total_revenue - totalResult[0].total_expenditure,
            by_category: byCategory,
            monthly: monthlyData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single expenditure
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM EXPENDITURE WHERE Expenditure_ID = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Expenditure not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create expenditure
router.post('/', async (req, res) => {
    try {
        const { Category, Description, Amount, Expenditure_Date, Added_By } = req.body;
        if (!Category || !Amount || !Expenditure_Date) {
            return res.status(400).json({ error: 'Category, Amount, and Date are required' });
        }
        const [result] = await pool.query(
            'INSERT INTO EXPENDITURE (Category, Description, Amount, Expenditure_Date, Added_By) VALUES (?, ?, ?, ?, ?)',
            [Category, Description || null, Amount, Expenditure_Date, Added_By || 'admin']
        );
        res.status(201).json({ id: result.insertId, message: 'Expenditure added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update expenditure
router.put('/:id', async (req, res) => {
    try {
        const { Category, Description, Amount, Expenditure_Date, Added_By } = req.body;
        const [result] = await pool.query(
            'UPDATE EXPENDITURE SET Category=?, Description=?, Amount=?, Expenditure_Date=?, Added_By=? WHERE Expenditure_ID=?',
            [Category, Description, Amount, Expenditure_Date, Added_By || 'admin', req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Expenditure not found' });
        res.json({ message: 'Expenditure updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE expenditure
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM EXPENDITURE WHERE Expenditure_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Expenditure not found' });
        res.json({ message: 'Expenditure deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
