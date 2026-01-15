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

    static async createModule(name, description, usage_config, adminId, clientInfo = {}) {
        const moduleId = await Module.create(name, description, usage_config);

        // Log creation
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'CREATE',
                entity_type: 'module',
                entity_id: moduleId,
                new_values: { name, description, usage_config },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }

        return moduleId;
    }

    static async updateModule(id, data, adminId, clientInfo = {}) {
        // Get old values for audit log
        const oldModule = await Module.findById(id);
        if (!oldModule) throw new Error('Module not found');

        // Merge old data with new data to ensure nothing is lost if partial update (though controller sends full usually)
        // But here we just pass data to model.
        await Module.update(id, data);

        // Log update
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'UPDATE',
                entity_type: 'module',
                entity_id: id,
                old_values: { name: oldModule.name, description: oldModule.description, usage_config: oldModule.usage_config },
                new_values: data,
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }

    static async deleteModule(id, adminId, clientInfo = {}) {
        // Get module data before deletion for audit log
        const module = await Module.findById(id);
        if (!module) throw new Error('Module not found');

        await Module.delete(id);

        // Log deletion
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'DELETE',
                entity_type: 'module',
                entity_id: id,
                old_values: { name: module.name, description: module.description },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }
}

module.exports = ModuleService;
