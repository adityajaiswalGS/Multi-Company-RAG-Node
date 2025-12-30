const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const userController = require('../controllers/userController');
const docController = require('../controllers/docController');
const authMiddleware = require('../middleware/authMiddleware');
const { isStrictCompanyAdmin } = require('../middleware/roleMiddleware');

/* ---------------------------------
   1. GLOBAL AUTHENTICATION
---------------------------------- */
// Apply authMiddleware to ALL routes (User must be logged in)
router.use(authMiddleware);

/* ---------------------------------
   2. SHARED ROUTES (Admins + Users)
---------------------------------- */
// IMPORTANT: We REMOVED 'isStrictCompanyAdmin' from here.
// Standard users need this to populate their Chat Sidebar.
router.get('/docs', docController.getDocs);

/* ---------------------------------
   3. ADMIN-ONLY ROUTES
---------------------------------- */
// All routes below require the user to be a Company Admin

// --- USER MANAGEMENT ---
router.post('/users', isStrictCompanyAdmin, userController.createUser);
router.get('/users', isStrictCompanyAdmin, userController.getCompanyUsers);
router.delete('/users/:id', isStrictCompanyAdmin, userController.deleteUser);

// --- DOCUMENT MANAGEMENT (Write Access) ---
router.post(
  '/docs',
  isStrictCompanyAdmin, // Only Admins can upload
  upload.single('file'),
  docController.uploadDocument
);

router.delete('/docs/:id', isStrictCompanyAdmin, docController.deleteDoc); // Only Admins can delete

module.exports = router;