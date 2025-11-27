const db = require('../config/db');

class AuditLog {
    static async create(logData) {
        const { admin_id, admin_email, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent } = logData;

        const [result] = await db.execute(
            `INSERT INTO audit_logs 
            (admin_id, admin_email, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                admin_id,
                admin_email || null,
                action,
                entity_type,
                entity_id,
                old_values ? JSON.stringify(old_values) : null,
                new_values ? JSON.stringify(new_values) : null,
                ip_address || null,
                user_agent || null
            ]
        );
        return result.insertId;
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT 
                al.*,
                a.email as admin_email
            FROM audit_logs al
            LEFT JOIN admins a ON al.admin_id = a.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.entity_type) {
            query += ' AND al.entity_type = ?';
            params.push(filters.entity_type);
        }

        if (filters.action) {
            query += ' AND al.action = ?';
            params.push(filters.action);
        }

        if (filters.admin_id) {
            query += ' AND al.admin_id = ?';
            params.push(filters.admin_id);
        }

        if (filters.date_from) {
            query += ' AND al.created_at >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            query += ' AND al.created_at <= ?';
            params.push(filters.date_to);
        }

        query += ' ORDER BY al.created_at DESC LIMIT 1000';

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async findByEntity(entity_type, entity_id) {
        const [rows] = await db.execute(
            `SELECT 
                al.*,
                a.email as admin_email
            FROM audit_logs al
            LEFT JOIN admins a ON al.admin_id = a.id
            WHERE al.entity_type = ? AND al.entity_id = ?
            ORDER BY al.created_at DESC`,
            [entity_type, entity_id]
        );
        return rows;
    }

    static async findByAdmin(admin_id) {
        const [rows] = await db.execute(
            `SELECT * FROM audit_logs 
            WHERE admin_id = ? 
            ORDER BY created_at DESC`,
            [admin_id]
        );
        return rows;
    }
}

module.exports = AuditLog;
