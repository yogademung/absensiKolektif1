const db = require('../config/db');

class OthersInformation {
    static async findAll() {
        const [rows] = await db.execute(
            'SELECT * FROM others_information ORDER BY type ASC, created_at DESC'
        );
        return rows;
    }

    static async findByType(type) {
        const [rows] = await db.execute(
            'SELECT * FROM others_information WHERE type = ? ORDER BY created_at DESC',
            [type]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM others_information WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        const { type, detail } = data;
        const [result] = await db.execute(
            'INSERT INTO others_information (type, detail) VALUES (?, ?)',
            [type, detail]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { type, detail } = data;
        await db.execute(
            'UPDATE others_information SET type = ?, detail = ? WHERE id = ?',
            [type, detail, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM others_information WHERE id = ?', [id]);
    }
}

module.exports = OthersInformation;
