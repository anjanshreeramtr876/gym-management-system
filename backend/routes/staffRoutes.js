const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

// Generate a unique 8-character access key
function generateAccessKey() {
    return 'GYM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// POST /api/staff/login  — Staff login with name + access key
router.post('/login', async (req, res) => {
    try {
        const { staff_name, access_key } = req.body;

        if (!staff_name || !access_key) {
            return res.status(400).json({ error: 'Name and access key are required' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM STAFF WHERE Access_Key = ? AND Is_Active = 1',
            [access_key.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid access key or account is deactivated' });
        }

        const staff = rows[0];

        // Verify the name matches (case-insensitive)
        if (staff.Staff_Name.toLowerCase() !== staff_name.trim().toLowerCase()) {
            return res.status(401).json({ error: 'Name does not match the access key' });
        }

        res.json({
            message: 'Staff login successful',
            user: {
                id: staff.Staff_ID,
                name: staff.Staff_Name,
                email: staff.Email,
                role: 'staff',
                access_key: staff.Access_Key
            }
        });
    } catch (err) {
        console.error('Staff login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

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

// POST create staff (admin adds staff, key is auto-generated)
router.post('/', async (req, res) => {
    try {
        const { Staff_Name, Email, Phone, Role } = req.body;

        if (!Staff_Name) {
            return res.status(400).json({ error: 'Staff name is required' });
        }

        // Generate unique access key
        let access_key;
        let isUnique = false;
        while (!isUnique) {
            access_key = generateAccessKey();
            const [existing] = await pool.query('SELECT Staff_ID FROM STAFF WHERE Access_Key = ?', [access_key]);
            if (existing.length === 0) isUnique = true;
        }

        const [result] = await pool.query(
            'INSERT INTO STAFF (Staff_Name, Email, Phone, Role, Access_Key) VALUES (?, ?, ?, ?, ?)',
            [Staff_Name, Email || null, Phone || null, Role || 'staff', access_key]
        );

        res.status(201).json({
            id: result.insertId,
            access_key: access_key,
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

// PUT regenerate access key
router.put('/:id/regenerate-key', async (req, res) => {
    try {
        let access_key;
        let isUnique = false;
        while (!isUnique) {
            access_key = generateAccessKey();
            const [existing] = await pool.query('SELECT Staff_ID FROM STAFF WHERE Access_Key = ?', [access_key]);
            if (existing.length === 0) isUnique = true;
        }

        const [result] = await pool.query(
            'UPDATE STAFF SET Access_Key = ? WHERE Staff_ID = ?',
            [access_key, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json({ access_key, message: 'Access key regenerated successfully' });
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
