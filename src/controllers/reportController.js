const ScheduleReport = require('../models/ScheduleReport');
const TokenLogReport = require('../models/TokenLogReport');
const response = require('../utils/response');

class ReportController {
    static async getScheduleStats(req, res) {
        try {
            const schedules = await ScheduleReport.getAllSchedulesWithStats();
            return response(res, 200, true, 'Schedule statistics retrieved', schedules);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async getScheduleRegistrations(req, res) {
        try {
            const { scheduleId } = req.params;
            const registrations = await ScheduleReport.getRegistrationsBySchedule(scheduleId);
            return response(res, 200, true, 'Schedule registrations retrieved', registrations);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async getTokenLogs(req, res) {
        try {
            const logs = await TokenLogReport.getAllWithDetails();
            return response(res, 200, true, 'Token logs retrieved', logs);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async getTokenLogsBySchedule(req, res) {
        try {
            const { scheduleId } = req.params;
            const logs = await TokenLogReport.getBySchedule(scheduleId);
            return response(res, 200, true, 'Token logs retrieved', logs);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async getTokenLogsByHotel(req, res) {
        try {
            const { hotelId } = req.params;
            const logs = await TokenLogReport.getByHotel(hotelId);
            return response(res, 200, true, 'Token logs retrieved', logs);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = ReportController;
