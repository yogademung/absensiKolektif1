const ModuleService = require('../services/moduleService');
const response = require('../utils/response');

class AdminModuleController {
    static async getAll(req, res) {
        try {
            const modules = await ModuleService.getAllModules();
            return response(res, 200, true, 'Modules retrieved', modules);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async create(req, res) {
        try {
            const { name, description } = req.body;
            if (!name) return response(res, 400, false, 'Name is required');

            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;
            const id = await ModuleService.createModule(name, description, adminId, clientInfo);
            return response(res, 201, true, 'Module created', { id });
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            await ModuleService.updateModule(id, { name, description }, adminId, clientInfo);
            return response(res, 200, true, 'Module updated');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            await ModuleService.deleteModule(id, adminId, clientInfo);
            return response(res, 200, true, 'Module deleted');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = AdminModuleController;
