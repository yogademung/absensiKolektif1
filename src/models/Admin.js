const db = require('../config/db');

class Admin {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
        return rows[0];
    }

    static async create(email, passwordHash, role = 'super_admin', hotelId = null) {
        const [result] = await db.execute('INSERT INTO admins (email, password_hash, role, hotel_id) VALUES (?, ?, ?, ?)', [email, passwordHash, role, hotelId]);
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT id, email, role, hotel_id, status, created_at FROM admins ORDER BY created_at DESC');
        return rows;
    }

    static async findAllActive() {
        const [rows] = await db.execute('SELECT id, email, role, hotel_id, created_at FROM admins WHERE status = ? ORDER BY created_at DESC', ['active']);
        return rows;
    }

    static async delete(id) {
        await db.execute('DELETE FROM admins WHERE id = ?', [id]);
    }

    static async softDelete(id) {
        await db.execute('UPDATE admins SET status = ? WHERE id = ?', ['inactive', id]);
    }

    static async activate(id) {
        await db.execute('UPDATE admins SET status = ? WHERE id = ?', ['active', id]);
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT id, email, role, hotel_id, status, created_at FROM admins WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = Admin;
