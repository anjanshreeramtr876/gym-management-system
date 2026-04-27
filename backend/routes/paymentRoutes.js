const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all payments
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, m.Name AS Member_Name 
             FROM PAYMENT p 
             LEFT JOIN MEMBER m ON p.Member_ID = m.Member_ID 
             ORDER BY p.Payment_ID DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single payment
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM PAYMENT WHERE Payment_ID = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create payment
router.post('/', async (req, res) => {
    try {
        const { Member_ID, Amount, Payment_Date, Payment_Method, Membership_Type } = req.body;
        const [result] = await pool.query(
            'INSERT INTO PAYMENT (Member_ID, Amount, Payment_Date, Payment_Method, Membership_Type) VALUES (?, ?, ?, ?, ?)',
            [Member_ID, Amount, Payment_Date, Payment_Method, Membership_Type]
        );
        res.status(201).json({ id: result.insertId, message: 'Payment recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update payment
router.put('/:id', async (req, res) => {
    try {
        const { Member_ID, Amount, Payment_Date, Payment_Method, Membership_Type } = req.body;
        const [result] = await pool.query(
            'UPDATE PAYMENT SET Member_ID=?, Amount=?, Payment_Date=?, Payment_Method=?, Membership_Type=? WHERE Payment_ID=?',
            [Member_ID, Amount, Payment_Date, Payment_Method, Membership_Type, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
        res.json({ message: 'Payment updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM PAYMENT WHERE Payment_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
        res.json({ message: 'Payment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
