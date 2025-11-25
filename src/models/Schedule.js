const db = require('../config/db');

class Schedule {
    static async findAll(moduleId = null) {
        let query = 'SELECT ts.*, tm.name as module_name FROM training_schedules ts JOIN training_modules tm ON ts.module_id = tm.id';
        const params = [];

        if (moduleId) {
            query += ' WHERE ts.module_id = ?';
            params.push(moduleId);
        }

        query += ' ORDER BY ts.date ASC, ts.start_time ASC';

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM training_schedules WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { module_id, date, session, start_time, end_time, zoom_link, max_participants } = data;
        const [result] = await db.execute(
            'INSERT INTO training_schedules (module_id, date, session, start_time, end_time, zoom_link, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [module_id, date, session, start_time, end_time, zoom_link, max_participants]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { module_id, date, session, start_time, end_time, zoom_link, max_participants } = data;
        await db.execute(
            'UPDATE training_schedules SET module_id = ?, date = ?, session = ?, start_time = ?, end_time = ?, zoom_link = ?, max_participants = ? WHERE id = ?',
            [module_id, date, session, start_time, end_time, zoom_link, max_participants, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM training_schedules WHERE id = ?', [id]);
    }
}

module.exports = Schedule;
