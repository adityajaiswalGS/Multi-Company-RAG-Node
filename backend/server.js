// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import modular routes
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
// ✅ FIXED: Point this to adminRoutes, not superAdminRoutes
const adminRoutes = require('./routes/adminRoutes'); 
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// --- GLOBAL MIDDLEWARE ---
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(express.json()); 

// --- MODULAR ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/super', superAdminRoutes); // Uses isSuperAdmin
app.use('/api/admin', adminRoutes);      // Uses isAdmin (allows both)
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/health', (req, res) => res.send('Company Bot API is running...'));

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
    .then(() => {
        console.log('PostgreSQL Database connected via Sequelize.');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });