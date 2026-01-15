const db = require('../config/db');

class Module {
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM training_modules');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM training_modules WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(name, description, usage_config = null) {
        const [result] = await db.execute(
            'INSERT INTO training_modules (name, description, usage_config) VALUES (?, ?, ?)',
            [name, description, usage_config ? JSON.stringify(usage_config) : null]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, description, usage_config } = data;
        await db.execute(
            'UPDATE training_modules SET name = ?, description = ?, usage_config = ? WHERE id = ?',
            [name, description || null, usage_config ? JSON.stringify(usage_config) : null, id]
        );
    }
}

module.exports = Module;
