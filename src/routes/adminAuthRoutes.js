const express = require('express');
const AdminAuthController = require('../controllers/adminAuthController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.post('/login', AdminAuthController.login);
router.post('/logout', AdminAuthController.logout);
router.get('/me', authAdmin, AdminAuthController.getMe);

module.exports = router;
