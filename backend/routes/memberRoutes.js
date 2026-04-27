const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all members
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT m.*, t.Trainer_Name 
             FROM MEMBER m 
             LEFT JOIN TRAINER t ON m.Trainer_ID = t.Trainer_ID 
             ORDER BY m.Member_ID DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single member
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM MEMBER WHERE Member_ID = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create member
router.post('/', async (req, res) => {
    try {
        const { Name, Age, Gender, Phone, Address, Join_Date, Trainer_ID } = req.body;
        const [result] = await pool.query(
            'INSERT INTO MEMBER (Name, Age, Gender, Phone, Address, Join_Date, Trainer_ID) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [Name, Age, Gender, Phone, Address, Join_Date, Trainer_ID || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Member added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update member
router.put('/:id', async (req, res) => {
    try {
        const { Name, Age, Gender, Phone, Address, Join_Date, Trainer_ID } = req.body;
        const [result] = await pool.query(
            'UPDATE MEMBER SET Name=?, Age=?, Gender=?, Phone=?, Address=?, Join_Date=?, Trainer_ID=? WHERE Member_ID=?',
            [Name, Age, Gender, Phone, Address, Join_Date, Trainer_ID || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Member not found' });
        res.json({ message: 'Member updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE member
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM MEMBER WHERE Member_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Member not found' });
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
