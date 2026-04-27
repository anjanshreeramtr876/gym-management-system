const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all workouts (optionally filter by trainer_id or member_id)
router.get('/', async (req, res) => {
    try {
        const { trainer_id, member_id } = req.query;
        let query = `
            SELECT w.*, m.Name AS Member_Name, t.Trainer_Name 
            FROM WORKOUT w
            LEFT JOIN MEMBER m ON w.Member_ID = m.Member_ID
            LEFT JOIN TRAINER t ON w.Trainer_ID = t.Trainer_ID
        `;
        const params = [];

        if (trainer_id) {
            query += ' WHERE w.Trainer_ID = ?';
            params.push(trainer_id);
        } else if (member_id) {
            query += ' WHERE w.Member_ID = ?';
            params.push(member_id);
        }

        query += ' ORDER BY w.Created_At DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single workout
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT w.*, m.Name AS Member_Name, t.Trainer_Name 
            FROM WORKOUT w
            LEFT JOIN MEMBER m ON w.Member_ID = m.Member_ID
            LEFT JOIN TRAINER t ON w.Trainer_ID = t.Trainer_ID
            WHERE w.Workout_ID = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Workout not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create workout
router.post('/', async (req, res) => {
    try {
        const { Member_ID, Trainer_ID, Workout_Name, Day_Of_Week, Exercises, Sets_Reps, Duration_Minutes, Notes } = req.body;

        if (!Member_ID || !Trainer_ID || !Workout_Name || !Day_Of_Week) {
            return res.status(400).json({ error: 'Member, Trainer, Workout Name, and Day are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO WORKOUT (Member_ID, Trainer_ID, Workout_Name, Day_Of_Week, Exercises, Sets_Reps, Duration_Minutes, Notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [Member_ID, Trainer_ID, Workout_Name, Day_Of_Week, Exercises || null, Sets_Reps || null, Duration_Minutes || null, Notes || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Workout assigned successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update workout
router.put('/:id', async (req, res) => {
    try {
        const { Workout_Name, Day_Of_Week, Exercises, Sets_Reps, Duration_Minutes, Notes } = req.body;
        const [result] = await pool.query(
            `UPDATE WORKOUT SET Workout_Name=?, Day_Of_Week=?, Exercises=?, Sets_Reps=?, Duration_Minutes=?, Notes=? WHERE Workout_ID=?`,
            [Workout_Name, Day_Of_Week, Exercises || null, Sets_Reps || null, Duration_Minutes || null, Notes || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Workout not found' });
        res.json({ message: 'Workout updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE workout
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM WORKOUT WHERE Workout_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Workout not found' });
        res.json({ message: 'Workout deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
