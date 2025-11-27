const ScheduleService = require('../services/scheduleService');
const response = require('../utils/response');

class AdminScheduleController {
    static async getAll(req, res) {
        try {
            const { module_id } = req.query;
            const schedules = await ScheduleService.getAllSchedules(module_id);
            return response(res, 200, true, 'Schedules retrieved', schedules);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async create(req, res) {
        try {
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;
            const id = await ScheduleService.createSchedule(req.body, adminId, clientInfo);
            return response(res, 201, true, 'Schedule created', { id });
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;
            await ScheduleService.updateSchedule(id, req.body, adminId, clientInfo);
            return response(res, 200, true, 'Schedule updated');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;
            await ScheduleService.deleteSchedule(id, adminId, clientInfo);
            return response(res, 200, true, 'Schedule deleted');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = AdminScheduleController;
