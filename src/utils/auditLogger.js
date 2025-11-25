const AuditLog = require('../models/AuditLog');

/**
 * Log audit trail for admin actions
 * @param {Object} params - Audit log parameters
 * @param {number} params.adminId - ID of admin performing action
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE)
 * @param {string} params.entityType - Type of entity (Hotel, Module, Schedule, Admin)
 * @param {number} params.entityId - ID of entity
 * @param {Object} params.oldValues - Old values before change (for UPDATE/DELETE)
 * @param {Object} params.newValues - New values after change (for CREATE/UPDATE)
 * @param {Object} params.req - Express request object (for IP and user agent)
 */
async function logAudit({ adminId, action, entityType, entityId, oldValues, newValues, req }) {
    try {
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('user-agent');

        await AuditLog.create({
            admin_id: adminId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_values: oldValues,
            new_values: newValues,
            ip_address,
            user_agent
        });
    } catch (error) {
        // Log error but don't throw - audit logging should not break the main operation
        console.error('Audit logging error:', error);
    }
}

module.exports = { logAudit };
