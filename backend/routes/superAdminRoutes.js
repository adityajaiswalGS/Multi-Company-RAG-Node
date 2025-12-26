const express = require('express');
const router = express.Router();
const superController = require('../controllers/superController');
const authMiddleware = require('../middleware/authMiddleware');
const { isSuperAdmin } = require('../middleware/roleMiddleware');

router.use(authMiddleware, isSuperAdmin);

router.post('/companies', superController.createCompany); 
router.get('/companies', superController.getAllCompanies); // Line 10?
router.post('/admins', superController.createCompanyAdmin);

module.exports = router;