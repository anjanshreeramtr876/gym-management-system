const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all staff
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM STAFF ORDER BY Staff_ID DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single staff
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM STAFF WHERE Staff_ID = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create staff (admin adds staff from manage-staff page)
router.post('/', async (req, res) => {
    try {
        const { Staff_Name, Email, Phone, Role } = req.body;

        if (!Staff_Name) {
            return res.status(400).json({ error: 'Staff name is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO STAFF (Staff_Name, Email, Phone, Role) VALUES (?, ?, ?, ?)',
            [Staff_Name, Email || null, Phone || null, Role || 'staff']
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Staff member added successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update staff
router.put('/:id', async (req, res) => {
    try {
        const { Staff_Name, Email, Phone, Role, Is_Active } = req.body;
        const [result] = await pool.query(
            'UPDATE STAFF SET Staff_Name=?, Email=?, Phone=?, Role=?, Is_Active=? WHERE Staff_ID=?',
            [Staff_Name, Email || null, Phone || null, Role || 'staff', Is_Active !== undefined ? Is_Active : 1, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json({ message: 'Staff updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM STAFF WHERE Staff_ID = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json({ message: 'Staff deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
