const AuditLog = require('../models/AuditLog');
const response = require('../utils/response');

class AuditLogController {
    static async getAll(req, res) {
        try {
            const { entity_type, action, date_from, date_to } = req.query;

            const filters = {};
            if (entity_type) filters.entity_type = entity_type;
            if (action) filters.action = action;
            if (date_from) filters.date_from = date_from;
            if (date_to) filters.date_to = date_to;

            const logs = await AuditLog.findAll(filters);
            return response(res, 200, true, 'Audit logs retrieved', logs);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async getByEntity(req, res) {
        try {
            const { entity_type, entity_id } = req.params;
            const logs = await AuditLog.findByEntity(entity_type, entity_id);
            return response(res, 200, true, 'Entity history retrieved', logs);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = AuditLogController;
