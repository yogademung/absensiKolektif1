const OthersInformation = require('../models/OthersInformation');
const AuditLog = require('../models/AuditLog');

class OthersInformationService {
    static async getAll() {
        return await OthersInformation.findAll();
    }

    static async getByType(type) {
        return await OthersInformation.findByType(type);
    }

    static async getById(id) {
        const info = await OthersInformation.findById(id);
        if (!info) throw new Error('Information not found');
        return info;
    }

    static async create(data, adminId, clientInfo = {}) {
        const id = await OthersInformation.create(data);

        // Audit log
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'CREATE',
                entity_type: 'others_information',
                entity_id: id,
                new_values: data,
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }

        return id;
    }

    static async update(id, data, adminId, clientInfo = {}) {
        const oldInfo = await this.getById(id);
        await OthersInformation.update(id, data);

        // Audit log
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'UPDATE',
                entity_type: 'others_information',
                entity_id: id,
                old_values: { type: oldInfo.type, detail: oldInfo.detail },
                new_values: data,
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }

    static async delete(id, adminId, clientInfo = {}) {
        const info = await this.getById(id);
        await OthersInformation.delete(id);

        // Audit log
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'DELETE',
                entity_type: 'others_information',
                entity_id: id,
                old_values: { type: info.type, detail: info.detail },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }
}

module.exports = OthersInformationService;
