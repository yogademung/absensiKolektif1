const AdminManagementService = require('../services/adminManagementService');
const response = require('../utils/response');

class AdminManagementController {
    static async getAll(req, res) {
        try {
            const admins = await AdminManagementService.getAllAdmins();
            return response(res, 200, true, 'Admins retrieved', admins);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async create(req, res) {
        try {
            const { email, password, role, hotel_id } = req.body;

            if (!email || !password) {
                return response(res, 400, false, 'Email and password are required');
            }

            if (password.length < 6) {
                return response(res, 400, false, 'Password must be at least 6 characters');
            }

            const adminId = req.admin?.id;
            const id = await AdminManagementService.createAdmin(email, password, adminId, role, hotel_id);
            return response(res, 201, true, 'Admin created successfully', { id });
        } catch (error) {
            return response(res, 400, false, error.message);
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            await AdminManagementService.deleteAdmin(id, adminId);
            return response(res, 200, true, 'Admin deleted');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = AdminManagementController;
