const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminAuthService {
    static async login(email, password) {
        const admin = await Admin.findByEmail(email);
        if (!admin) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        return token;
    }
}

module.exports = AdminAuthService;
