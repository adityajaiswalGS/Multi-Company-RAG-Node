const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for memory storage (required for AWS S3 uploads)
const upload = multer({ storage: multer.memoryStorage() });

const userController = require('../controllers/userController');
const docController = require('../controllers/docController');
const authMiddleware = require('../middleware/authMiddleware');

// 🔒 STRICT company admin check
const { isStrictCompanyAdmin } = require('../middleware/roleMiddleware');

/* ---------------------------------
   Global Protection
---------------------------------- */
// Only AUTHENTICATED + COMPANY ADMINS
router.use(authMiddleware, isStrictCompanyAdmin);

/* ---------------------------------
   USER MANAGEMENT
---------------------------------- */
// Company Admin creates users ONLY for their own company
router.post('/users', userController.createUser);

// Lists users belonging to the admin's company
router.get('/users', userController.getCompanyUsers);

// Revoke company user access
router.delete('/users/:id', userController.deleteUser);

/* ---------------------------------
   DOCUMENT MANAGEMENT
---------------------------------- */
// List company documents
router.get('/docs', docController.getDocs);

// Upload document to S3 (company-scoped)
router.post(
  '/docs',
  upload.single('file'),
  docController.uploadDocument
);

// Delete document from S3 and DB
router.delete('/docs/:id', docController.deleteDoc);

module.exports = router;
