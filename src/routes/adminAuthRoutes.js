const express = require('express');
const AdminAuthController = require('../controllers/adminAuthController');
const CaptchaController = require('../controllers/captchaController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.get('/captcha', CaptchaController.generate);
router.post('/login', AdminAuthController.login);
router.post('/logout', AdminAuthController.logout);
router.get('/me', authAdmin, AdminAuthController.getMe);

module.exports = router;
