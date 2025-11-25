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

    static async create(name, description) {
        const [result] = await db.execute('INSERT INTO training_modules (name, description) VALUES (?, ?)', [name, description]);
        return result.insertId;
    }

    static async update(id, name, description) {
        await db.execute('UPDATE training_modules SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    }

    static async delete(id) {
        await db.execute('DELETE FROM training_modules WHERE id = ?', [id]);
    }

    static async update(id, data) {
        const { name, description } = data;
        await db.execute(
            'UPDATE training_modules SET name = ?, description = ? WHERE id = ?',
            [name, description || null, id]
        );
    }
}

module.exports = Module;
