const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const memberRoutes = require('./routes/memberRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/authRoutes');
const dietPlanRoutes = require('./routes/dietPlanRoutes');
const staffRoutes = require('./routes/staffRoutes');
const expenditureRoutes = require('./routes/expenditureRoutes');
const issueRoutes = require('./routes/issueRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/workouts', workoutRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Gym Management API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🏋️  Gym Management System API`);
    console.log(`   Server running on http://localhost:${PORT}`);
    console.log(`   Admin Login:     http://localhost:${PORT}/login.html`);
    console.log(`   Staff Login:     http://localhost:${PORT}/staff-login.html`);
    console.log(`   Trainer Login:   http://localhost:${PORT}/trainer-login.html`);
    console.log(`   Admin Dashboard: http://localhost:${PORT}/index.html`);
    console.log(`   API Base:        http://localhost:${PORT}/api\n`);
});
