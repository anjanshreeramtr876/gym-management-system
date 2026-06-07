const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all trainers
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM TRAINER ORDER BY Trainer_ID DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single trainer
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM TRAINER WHERE Trainer_ID = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Trainer not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET members assigned to a trainer
router.get('/:id/members', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM MEMBER WHERE Trainer_ID = ? ORDER BY Name',
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create trainer
router.post('/', async (req, res) => {
    try {
        const { Trainer_Name, Specialization, Phone, Experience } = req.body;

        if (!Trainer_Name) {
            return res.status(400).json({ error: 'Trainer name is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO TRAINER (Trainer_Name, Specialization, Phone, Experience) VALUES (?, ?, ?, ?)',
            [Trainer_Name, Specialization || null, Phone || null, Experience || 0]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Trainer added successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update trainer
router.put('/:id', async (req, res) => {
    try {
        const { Trainer_Name, Specialization, Phone, Experience, Is_Active } = req.body;
        const [result] = await pool.query(
            'UPDATE TRAINER SET Trainer_Name=?, Specialization=?, Phone=?, Experience=?, Is_Active=? WHERE Trainer_ID=?',
            [Trainer_Name, Specialization || null, Phone || null, Experience || 0, Is_Active !== undefined ? Is_Active : 1, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Trainer not found' });
        res.json({ message: 'Trainer updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE trainer
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM TRAINER WHERE Trainer_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Trainer not found' });
        res.json({ message: 'Trainer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
