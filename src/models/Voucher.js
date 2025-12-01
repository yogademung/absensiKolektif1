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

    static async getByHotelId(hotelId) {
        const [rows] = await db.execute(
            `SELECT v.*, tm.name as module_name, ts.date, ts.session, ts.start_time, ts.end_time, ts.zoom_link, ts.video_link
             FROM vouchers v
             JOIN training_modules tm ON v.module_id = tm.id
             JOIN training_schedules ts ON v.schedule_id = ts.id
             WHERE v.hotel_id = ?
             ORDER BY ts.date DESC, ts.start_time DESC`,
            [hotelId]
        );
        return rows;
    }

    // Hotel Schedule Assignment Methods
    static async findByScheduleId(scheduleId) {
        const [rows] = await db.execute(
            `SELECT v.*, h.name as hotel_name
             FROM vouchers v
             JOIN hotels h ON v.hotel_id = h.id
             WHERE v.schedule_id = ?`,
            [scheduleId]
        );
        return rows;
    }

    static async findHotelAssignments(hotelId = null) {
        let query = `SELECT v.*, h.name as hotel_name, tm.name as module_name, 
                     ts.date, ts.session, ts.start_time, ts.end_time, ts.zoom_link
                     FROM vouchers v
                     JOIN hotels h ON v.hotel_id = h.id
                     JOIN training_modules tm ON v.module_id = tm.id
                     JOIN training_schedules ts ON v.schedule_id = ts.id
                     WHERE v.staff_name = 'HOTEL_ASSIGNMENT'`;
        const params = [];

        if (hotelId) {
            query += ' AND v.hotel_id = ?';
            params.push(hotelId);
        }

        query += ' ORDER BY ts.date ASC, ts.start_time ASC';

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async createHotelAssignment(hotelId, moduleId, scheduleId, zoomLink = null) {
        const [result] = await db.execute(
            'INSERT INTO vouchers (staff_name, hotel_id, module_id, schedule_id, zoom_link, token_cost) VALUES (?, ?, ?, ?, ?, ?)',
            ['HOTEL_ASSIGNMENT', hotelId, moduleId, scheduleId, zoomLink, 1]
        );
        return result.insertId;
    }

    static async createBulkHotelAssignments(assignments) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const insertedIds = [];
            for (const assignment of assignments) {
                const { hotelId, moduleId, scheduleId, zoomLink } = assignment;
                const [result] = await connection.execute(
                    'INSERT INTO vouchers (staff_name, hotel_id, module_id, schedule_id, zoom_link, token_cost) VALUES (?, ?, ?, ?, ?, ?)',
                    ['HOTEL_ASSIGNMENT', hotelId, moduleId, scheduleId, zoomLink, 1]
                );
                insertedIds.push(result.insertId);
            }

            await connection.commit();
            return insertedIds;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async deleteHotelAssignment(id) {
        await db.execute('DELETE FROM vouchers WHERE id = ? AND staff_name = ?', [id, 'HOTEL_ASSIGNMENT']);
    }

    static async deleteByScheduleId(scheduleId) {
        await db.execute('DELETE FROM vouchers WHERE schedule_id = ? AND staff_name = ?', [scheduleId, 'HOTEL_ASSIGNMENT']);
    }
}

module.exports = Voucher;
