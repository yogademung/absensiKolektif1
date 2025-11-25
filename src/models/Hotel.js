const db = require('../config/db');

class Hotel {
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM hotels');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM hotels WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(name, tokenQuota) {
        const [result] = await db.execute('INSERT INTO hotels (name, token_quota) VALUES (?, ?)', [name, tokenQuota]);
        return result.insertId;
    }

    static async update(id, data) {
        const { name, token_quota } = data;
        await db.execute(
            'UPDATE hotels SET name = ?, token_quota = ? WHERE id = ?',
            [name, token_quota, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM hotels WHERE id = ?', [id]);
    }

    static async updateTokenUsage(id, tokenUsed) {
        await db.execute('UPDATE hotels SET token_used = ? WHERE id = ?', [tokenUsed, id]);
    }
}

module.exports = Hotel;
