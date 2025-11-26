const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

class AdminManagementService {
    static async getAllAdmins() {
        return await Admin.findAll();
    }

    static async createAdmin(email, password, creatorAdminId, role = 'super_admin', hotelId = null) {
        // Check if admin already exists
        const existing = await Admin.findByEmail(email);
        if (existing) {
            throw new Error('Admin with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create admin
        const adminId = await Admin.create(email, passwordHash, role, hotelId);

        // Log creation
        if (creatorAdminId) {
            await AuditLog.create({
                admin_id: creatorAdminId,
                action: 'CREATE',
                entity_type: 'admin',
                entity_id: adminId,
                new_values: { email, role, hotelId }
            });
        }

        return adminId;
    }

    static async deleteAdmin(id, deleterAdminId) {
        // Get admin data before deletion for audit log
        const admin = await Admin.findById(id);
        if (!admin) throw new Error('Admin not found');

        await Admin.delete(id);

        // Log deletion
        if (deleterAdminId) {
            await AuditLog.create({
                admin_id: deleterAdminId,
                action: 'DELETE',
                entity_type: 'admin',
                entity_id: id,
                old_values: { email: admin.email }
            });
        }
    }
}

module.exports = AdminManagementService;
