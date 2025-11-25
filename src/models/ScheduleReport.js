const db = require('../config/db');

class ScheduleReport {
    static async getRegistrationsBySchedule(scheduleId) {
        const [rows] = await db.execute(
            `SELECT 
                h.id as hotel_id,
                h.name as hotel_name,
                COUNT(DISTINCT v.id) as total_registrations,
                COUNT(DISTINCT v.staff_name) as unique_staff,
                MIN(v.created_at) as first_registration,
                MAX(v.created_at) as last_registration
             FROM vouchers v
             JOIN hotels h ON v.hotel_id = h.id
             WHERE v.schedule_id = ?
             GROUP BY h.id, h.name
             ORDER BY total_registrations DESC`,
            [scheduleId]
        );
        return rows;
    }

    static async getAllSchedulesWithStats() {
        const [rows] = await db.execute(
            `SELECT 
                ts.id,
                ts.date,
                ts.session,
                ts.start_time,
                ts.end_time,
                ts.zoom_link,
                tm.name as module_name,
                COUNT(DISTINCT v.hotel_id) as total_hotels,
                COUNT(DISTINCT v.id) as total_registrations,
                SUM(v.token_cost) as tokens_used
             FROM training_schedules ts
             LEFT JOIN training_modules tm ON ts.module_id = tm.id
             LEFT JOIN vouchers v ON ts.id = v.schedule_id
             GROUP BY ts.id, ts.date, ts.session, ts.start_time, ts.end_time, ts.zoom_link, tm.name
             ORDER BY ts.date DESC, ts.start_time DESC`
        );
        return rows;
    }
}

module.exports = ScheduleReport;
