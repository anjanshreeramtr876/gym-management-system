const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all diet plans (with member and trainer names)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT dp.*, m.Name AS Member_Name, t.Trainer_Name
            FROM DIET_PLAN dp
            JOIN MEMBER m ON dp.Member_ID = m.Member_ID
            JOIN TRAINER t ON dp.Trainer_ID = t.Trainer_ID
            ORDER BY dp.Plan_ID DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single diet plan
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT dp.*, m.Name AS Member_Name, t.Trainer_Name
            FROM DIET_PLAN dp
            JOIN MEMBER m ON dp.Member_ID = m.Member_ID
            JOIN TRAINER t ON dp.Trainer_ID = t.Trainer_ID
            WHERE dp.Plan_ID = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Diet plan not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET diet plans for a specific member
router.get('/member/:memberId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT dp.*, t.Trainer_Name
            FROM DIET_PLAN dp
            JOIN TRAINER t ON dp.Trainer_ID = t.Trainer_ID
            WHERE dp.Member_ID = ?
            ORDER BY dp.Plan_ID DESC
        `, [req.params.memberId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create diet plan
router.post('/', async (req, res) => {
    try {
        const { Member_ID, Trainer_ID, Plan_Name, Goal, Breakfast, Lunch, Dinner, Snacks, Notes, Created_At } = req.body;

        if (!Member_ID || !Trainer_ID || !Plan_Name) {
            return res.status(400).json({ error: 'Member, Trainer, and Plan Name are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO DIET_PLAN (Member_ID, Trainer_ID, Plan_Name, Goal, Breakfast, Lunch, Dinner, Snacks, Notes, Created_At)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [Member_ID, Trainer_ID, Plan_Name, Goal || null, Breakfast || null, Lunch || null, Dinner || null, Snacks || null, Notes || null, Created_At || new Date().toISOString().split('T')[0]]
        );
        res.status(201).json({ id: result.insertId, message: 'Diet plan created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update diet plan
router.put('/:id', async (req, res) => {
    try {
        const { Member_ID, Trainer_ID, Plan_Name, Goal, Breakfast, Lunch, Dinner, Snacks, Notes, Created_At } = req.body;
        const [result] = await pool.query(
            `UPDATE DIET_PLAN SET Member_ID=?, Trainer_ID=?, Plan_Name=?, Goal=?, Breakfast=?, Lunch=?, Dinner=?, Snacks=?, Notes=?, Created_At=? WHERE Plan_ID=?`,
            [Member_ID, Trainer_ID, Plan_Name, Goal || null, Breakfast || null, Lunch || null, Dinner || null, Snacks || null, Notes || null, Created_At || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Diet plan not found' });
        res.json({ message: 'Diet plan updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE diet plan
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM DIET_PLAN WHERE Plan_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Diet plan not found' });
        res.json({ message: 'Diet plan deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
