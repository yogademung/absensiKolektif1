const db = require('../config/db');

class Voucher {
    static async create(data) {
        const { staff_name, hotel_id, module_id, schedule_id, zoom_link, token_cost } = data;
        const [result] = await db.execute(
            'INSERT INTO vouchers (staff_name, hotel_id, module_id, schedule_id, zoom_link, token_cost) VALUES (?, ?, ?, ?, ?, ?)',
            [staff_name, hotel_id, module_id, schedule_id, zoom_link, token_cost]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT v.*, h.name as hotel_name, tm.name as module_name, ts.date, ts.start_time, ts.end_time 
       FROM vouchers v 
       JOIN hotels h ON v.hotel_id = h.id 
       JOIN training_modules tm ON v.module_id = tm.id 
       JOIN training_schedules ts ON v.schedule_id = ts.id 
       WHERE v.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async findByHotelAndSchedule(hotel_id, schedule_id) {
        const [rows] = await db.execute(
            'SELECT * FROM vouchers WHERE hotel_id = ? AND schedule_id = ? LIMIT 1',
            [hotel_id, schedule_id]
        );
        return rows[0];
    }
}

module.exports = Voucher;
