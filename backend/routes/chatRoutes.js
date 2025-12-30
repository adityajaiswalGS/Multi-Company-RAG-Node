const express = require('express');
const router = express.Router();

// 1. IMPORT docController (This was missing!)
const docController = require('../controllers/docController'); 
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect chat routes (Ensures req.user is populated with company_id)
router.use(authMiddleware);


router.get('/docs', docController.getDocs); 

// POST /api/chat/query - Send user query to RAG workflow
router.post('/query', chatController.queryRag);

module.exports = router;