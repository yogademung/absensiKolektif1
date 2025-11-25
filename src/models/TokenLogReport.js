const db = require('../config/db');

class TokenLogReport {
    static async getAllWithDetails() {
        const [rows] = await db.execute(
            `SELECT 
                tl.id,
                tl.token_change,
                tl.reason,
                tl.created_at,
                h.id as hotel_id,
                h.name as hotel_name,
                h.token_quota,
                h.token_used,
                v.id as voucher_id,
                v.staff_name,
                v.token_cost,
                tm.id as module_id,
                tm.name as module_name,
                ts.id as schedule_id,
                ts.date as schedule_date,
                ts.session,
                ts.start_time,
                ts.end_time,
                ts.zoom_link
             FROM token_logs tl
             JOIN hotels h ON tl.hotel_id = h.id
             LEFT JOIN vouchers v ON tl.registration_id = v.id
             LEFT JOIN training_modules tm ON v.module_id = tm.id
             LEFT JOIN training_schedules ts ON v.schedule_id = ts.id
             ORDER BY tl.created_at DESC`
        );
        return rows;
    }

    static async getBySchedule(scheduleId) {
        const [rows] = await db.execute(
            `SELECT 
                tl.id,
                tl.token_change,
                tl.reason,
                tl.created_at,
                h.id as hotel_id,
                h.name as hotel_name,
                v.id as voucher_id,
                v.staff_name,
                v.token_cost
             FROM token_logs tl
             JOIN hotels h ON tl.hotel_id = h.id
             LEFT JOIN vouchers v ON tl.registration_id = v.id
             WHERE v.schedule_id = ?
             ORDER BY tl.created_at DESC`,
            [scheduleId]
        );
        return rows;
    }

    static async getByHotel(hotelId) {
        const [rows] = await db.execute(
            `SELECT 
                tl.id,
                tl.token_change,
                tl.reason,
                tl.created_at,
                v.id as voucher_id,
                v.staff_name,
                v.token_cost,
                tm.name as module_name,
                ts.date as schedule_date,
                ts.session
             FROM token_logs tl
             LEFT JOIN vouchers v ON tl.registration_id = v.id
             LEFT JOIN training_modules tm ON v.module_id = tm.id
             LEFT JOIN training_schedules ts ON v.schedule_id = ts.id
             WHERE tl.hotel_id = ?
             ORDER BY tl.created_at DESC`,
            [hotelId]
        );
        return rows;
    }
}

module.exports = TokenLogReport;
