const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect chat routes with authMiddleware to ensure company isolation
router.use(authMiddleware);

// POST /api/chat/query - Send user query to RAG workflow
router.post('/query', chatController.queryRag);

module.exports = router;