const AdminAuthService = require('../services/adminAuthService');
const response = require('../utils/response');

class AdminAuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return response(res, 400, false, 'Email and password are required');
            }

            const token = await AdminAuthService.login(email, password);

            // Set cookie for easier frontend handling, but also return in body
            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

            return response(res, 200, true, 'Login successful', { token });
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
