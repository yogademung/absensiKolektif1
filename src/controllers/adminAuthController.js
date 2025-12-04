const AdminAuthService = require('../services/adminAuthService');
const CaptchaService = require('../services/captchaService');
const response = require('../utils/response');

class AdminAuthController {
    static async login(req, res) {
        try {
            const { email, password, captchaId, captchaInput } = req.body;

            // Validate required fields
            if (!email || !password) {
                return response(res, 400, false, 'Email and password are required');
            }

            // Validate CAPTCHA
            if (!captchaId || !captchaInput) {
                return response(res, 400, false, 'CAPTCHA is required');
            }

            const isCaptchaValid = CaptchaService.validate(captchaId, captchaInput);
            if (!isCaptchaValid) {
                return response(res, 400, false, 'Invalid or expired CAPTCHA');
            }

            const clientInfo = {
                ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
                user_agent: req.headers['user-agent']
            };

            const { token, user } = await AdminAuthService.login(email, password, clientInfo);

            // Set cookie for easier frontend handling, but also return in body
            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

            return response(res, 200, true, 'Login successful', { token, user });
        } catch (error) {
            return response(res, 401, false, error.message);
        }
    }

    static async logout(req, res) {
        res.clearCookie('token');
        return response(res, 200, true, 'Logout successful');
    }

    static async getMe(req, res) {
        return response(res, 200, true, 'Authenticated', req.admin);
    }
}

module.exports = AdminAuthController;
