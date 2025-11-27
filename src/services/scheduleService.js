const Schedule = require('../models/Schedule');
const AuditLog = require('../models/AuditLog');

class ScheduleService {
    static async getAllSchedules(moduleId) {
        return await Schedule.findAll(moduleId);
    }

    static async getScheduleById(id) {
        const schedule = await Schedule.findById(id);
        if (!schedule) throw new Error('Schedule not found');
        return schedule;
    }

    static async createSchedule(data, adminId, clientInfo = {}) {
        const scheduleId = await Schedule.create(data);

        // Log creation
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'CREATE',
                entity_type: 'schedule',
                entity_id: scheduleId,
                new_values: data,
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }

        return scheduleId;
    }

    static async updateSchedule(id, data, adminId, clientInfo = {}) {
        // Get old values for audit log
        const oldSchedule = await this.getScheduleById(id);

        await Schedule.update(id, data);

        // Log update
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'UPDATE',
                entity_type: 'schedule',
                entity_id: id,
                old_values: {
                    module_id: oldSchedule.module_id,
                    date: oldSchedule.date,
                    session: oldSchedule.session,
                    start_time: oldSchedule.start_time,
                    end_time: oldSchedule.end_time,
                    zoom_link: oldSchedule.zoom_link
                },
                new_values: data,
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }

    static async deleteSchedule(id, adminId, clientInfo = {}) {
        // Get schedule data before deletion for audit log
        const schedule = await this.getScheduleById(id);

        await Schedule.delete(id);

        // Log deletion
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'DELETE',
                entity_type: 'schedule',
                entity_id: id,
                old_values: {
                    module_id: schedule.module_id,
                    date: schedule.date,
                    session: schedule.session,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    zoom_link: schedule.zoom_link
                },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }
}

module.exports = ScheduleService;
