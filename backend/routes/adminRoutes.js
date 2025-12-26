const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const userController = require('../controllers/userController');
const docController = require('../controllers/docController');
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.use(authMiddleware, isAdmin); // Protect all routes in this file

// User Management
router.post('/users', userController.createUser);
router.get('/users', userController.getCompanyUsers);
router.delete('/users/:id', userController.deleteUser);

// Document Management
router.get('/docs', docController.getDocs);
router.post('/docs', upload.single('file'), docController.uploadDocument);
router.delete('/docs/:id', docController.deleteDoc);

module.exports = router;