const Module = require('../models/Module');
const AuditLog = require('../models/AuditLog');

class ModuleService {
    static async getAllModules() {
        return await Module.findAll();
    }

    static async getModuleById(id) {
        const module = await Module.findById(id);
        if (!module) throw new Error('Module not found');
        return module;
    }

    static async createModule(name, description, adminId) {
        const moduleId = await Module.create(name, description);

        // Log creation
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'CREATE',
                entity_type: 'module',
                entity_id: moduleId,
                new_values: { name, description }
            });
        }

        return moduleId;
    }

    static async updateModule(id, data, adminId) {
        // Get old values for audit log
        const oldModule = await Module.findById(id);
        if (!oldModule) throw new Error('Module not found');

        await Module.update(id, data);

        // Log update
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'UPDATE',
                entity_type: 'module',
                entity_id: id,
                old_values: { name: oldModule.name, description: oldModule.description },
                new_values: data
            });
        }
    }

    static async deleteModule(id, adminId) {
        // Get module data before deletion for audit log
        const module = await Module.findById(id);
        if (!module) throw new Error('Module not found');

        await Module.delete(id);

        // Log deletion
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'DELETE',
                entity_type: 'module',
                entity_id: id,
                old_values: { name: module.name, description: module.description }
            });
        }
    }
}

module.exports = ModuleService;
