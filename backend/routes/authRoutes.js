const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../db');

// Validate password: at least 6 chars and at least 1 special character
function validatePassword(password) {
    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;
    if (!specialCharRegex.test(password)) {
        return 'Password must contain at least one special character (e.g. !@#$%^&*)';
    }
    return null;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Validate password strength
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        // Check if username already exists
        const [existing] = await pool.query('SELECT User_ID FROM USERS WHERE Username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Check if email already exists (if provided)
        if (email) {
            const [emailCheck] = await pool.query('SELECT User_ID FROM USERS WHERE Email = ?', [email]);
            if (emailCheck.length > 0) {
                return res.status(409).json({ error: 'Email already registered' });
            }
        }

        // Hash password and create user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO USERS (Username, Email, Password, Role) VALUES (?, ?, ?, ?)',
            [username, email || null, hashedPassword, 'admin']
        );

        res.status(201).json({
            message: 'Registration successful',
            user: { id: result.insertId, username, email, role: 'admin' }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const [users] = await pool.query('SELECT * FROM USERS WHERE Username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.User_ID,
                username: user.Username,
                email: user.Email,
                role: user.Role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

module.exports = router;
