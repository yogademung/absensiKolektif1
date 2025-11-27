const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuditLog = require('../models/AuditLog');

class AdminAuthService {
    static async login(email, password, clientInfo = {}) {
        const admin = await Admin.findByEmail(email);
        if (!admin) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({
            id: admin.id,
            email: admin.email,
            role: admin.role,
            hotel_id: admin.hotel_id
        }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        // Log Login
        await AuditLog.create({
            admin_id: admin.id,
            admin_email: admin.email,
            action: 'LOGIN',
            entity_type: 'admin',
            entity_id: admin.id,
            new_values: { email: admin.email, role: admin.role },
            ip_address: clientInfo.ip_address,
            user_agent: clientInfo.user_agent
        });

        return { token, user: { id: admin.id, email: admin.email, role: admin.role, hotel_id: admin.hotel_id } };
    }
}

module.exports = AdminAuthService;
