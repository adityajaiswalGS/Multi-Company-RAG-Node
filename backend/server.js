// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authController = require('./controllers/authController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require('./middleware/authMiddleware');
const docController = require('./controllers/docController');


const app = express();

// Middleware
app.use(cors()); // Allows your Next.js frontend to talk to this API
app.use(express.json()); // Allows the server to parse JSON data in requests

// --- ROUTES ---

// Auth Route
app.post('/api/auth/login', authController.login);

app.post('/api/admin/docs', 
    authMiddleware,             // 1. Check if user is logged in
    upload.single('file'),      // 2. Grab the file from the request
    docController.uploadDocument // 3. Run the upload logic
);


// Basic Health Check
app.get('/', (req, res) => res.send('Company Bot API is running...'));

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

// Authenticate DB connection then start listening
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