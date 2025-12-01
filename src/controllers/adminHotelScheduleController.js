const HotelScheduleService = require('../services/hotelScheduleService');
const response = require('../utils/response');

class AdminHotelScheduleController {
    // Get all hotel schedule assignments
    static async getAll(req, res) {
        try {
            const { hotel_id } = req.query;
            const assignments = await HotelScheduleService.getAllHotelSchedules(hotel_id);
            return response(res, 200, true, 'Hotel schedules retrieved', assignments);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    // Get schedules for specific hotel
    static async getByHotelId(req, res) {
        try {
            const { hotelId } = req.params;
            const schedules = await HotelScheduleService.getSchedulesByHotelId(hotelId);
            return response(res, 200, true, 'Hotel schedules retrieved', schedules);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    // Create single assignment
    static async create(req, res) {
        try {
            const { hotel_id, schedule_id } = req.body;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            if (!hotel_id || !schedule_id) {
                return response(res, 400, false, 'hotel_id and schedule_id are required');
            }

            const voucherId = await HotelScheduleService.createAssignment(
                hotel_id,
                schedule_id,
                adminId,
                clientInfo
            );

            return response(res, 201, true, 'Hotel schedule assignment created', { id: voucherId });
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    // Bulk assign hotels to schedules
    static async createBulk(req, res) {
        try {
            const { hotel_ids, schedule_ids } = req.body;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            if (!hotel_ids || !Array.isArray(hotel_ids) || hotel_ids.length === 0) {
                return response(res, 400, false, 'hotel_ids must be a non-empty array');
            }

            if (!schedule_ids || !Array.isArray(schedule_ids) || schedule_ids.length === 0) {
                return response(res, 400, false, 'schedule_ids must be a non-empty array');
            }

            const result = await HotelScheduleService.createBulkAssignments(
                hotel_ids,
                schedule_ids,
                adminId,
                clientInfo
            );

            return response(res, 201, true, `Created ${result.created} assignments`, result);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    // Bulk assign by date range
    static async createBulkByDateRange(req, res) {
        try {
            const { hotel_ids, start_date, end_date } = req.body;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            if (!hotel_ids || !Array.isArray(hotel_ids) || hotel_ids.length === 0) {
                return response(res, 400, false, 'hotel_ids must be a non-empty array');
            }

            if (!start_date || !end_date) {
                return response(res, 400, false, 'start_date and end_date are required');
            }

            const result = await HotelScheduleService.createBulkAssignmentsByDateRange(
                hotel_ids,
                start_date,
                end_date,
                adminId,
                clientInfo
            );

            return response(res, 201, true, `Created ${result.created} assignments`, result);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    // Remove assignment
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            await HotelScheduleService.removeAssignment(id, adminId, clientInfo);

            return response(res, 200, true, 'Hotel schedule assignment removed and token refunded');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = AdminHotelScheduleController;
