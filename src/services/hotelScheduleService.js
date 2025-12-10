const Voucher = require('../models/Voucher');
const Hotel = require('../models/Hotel');
const Schedule = require('../models/Schedule');
const AuditLog = require('../models/AuditLog');
const db = require('../config/db');

class HotelScheduleService {
    // Get all hotel schedule assignments
    static async getAllHotelSchedules(hotelId = null) {
        return await Voucher.findHotelAssignments(hotelId);
    }

    // Get schedules for a specific hotel
    static async getSchedulesByHotelId(hotelId) {
        return await Voucher.findHotelAssignments(hotelId);
    }

    // Validate if hotel has sufficient tokens
    static async validateHotelTokens(hotelId, requiredTokens) {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            throw new Error('Hotel not found');
        }

        const availableTokens = hotel.token_quota - hotel.token_used;
        if (availableTokens < requiredTokens) {
            throw new Error(`Insufficient tokens. Available: ${availableTokens}, Required: ${requiredTokens}`);
        }

        return true;
    }

    // Deduct tokens from hotel
    static async deductHotelTokens(hotelId, tokenAmount, registrationId = null, reason = 'Hotel Schedule Assignment') {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Get current hotel data
            const [hotelRows] = await connection.execute('SELECT * FROM hotels WHERE id = ?', [hotelId]);
            const hotel = hotelRows[0];

            if (!hotel) {
                throw new Error('Hotel not found');
            }

            // Update token_used
            const newTokenUsed = hotel.token_used + tokenAmount;
            await connection.execute(
                'UPDATE hotels SET token_used = ? WHERE id = ?',
                [newTokenUsed, hotelId]
            );

            // Log token change
            await connection.execute(
                'INSERT INTO token_logs (hotel_id, registration_id, token_change, reason) VALUES (?, ?, ?, ?)',
                [hotelId, registrationId, -tokenAmount, reason]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Refund tokens to hotel
    static async refundHotelTokens(hotelId, tokenAmount, registrationId = null, reason = 'Hotel Schedule Assignment Removed') {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Get current hotel data
            const [hotelRows] = await connection.execute('SELECT * FROM hotels WHERE id = ?', [hotelId]);
            const hotel = hotelRows[0];

            if (!hotel) {
                throw new Error('Hotel not found');
            }

            // Update token_used
            const newTokenUsed = Math.max(0, hotel.token_used - tokenAmount);
            await connection.execute(
                'UPDATE hotels SET token_used = ? WHERE id = ?',
                [newTokenUsed, hotelId]
            );

            // Log token change
            await connection.execute(
                'INSERT INTO token_logs (hotel_id, registration_id, token_change, reason) VALUES (?, ?, ?, ?)',
                [hotelId, registrationId, tokenAmount, reason]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Create single hotel schedule assignment
    static async createAssignment(hotelId, scheduleId, adminId, clientInfo = {}) {
        // Validate hotel exists
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            throw new Error('Hotel not found');
        }

        // Validate schedule exists
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            throw new Error('Schedule not found');
        }

        // Check if assignment already exists
        const existing = await Voucher.findByHotelAndSchedule(hotelId, scheduleId);
        if (existing) {
            throw new Error('This hotel is already assigned to this schedule');
        }

        // Validate tokens
        await this.validateHotelTokens(hotelId, 1);

        // Create assignment
        const voucherId = await Voucher.createHotelAssignment(
            hotelId,
            schedule.module_id,
            scheduleId,
            schedule.zoom_link
        );

        // Deduct token
        await this.deductHotelTokens(hotelId, 1, voucherId, 'Hotel Schedule Assignment');

        // Audit log
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'CREATE',
                entity_type: 'hotel_schedule',
                entity_id: voucherId,
                new_values: { hotel_id: hotelId, schedule_id: scheduleId },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }

        return voucherId;
    }

    // Bulk assign hotels to schedules
    static async createBulkAssignments(hotelIds, scheduleIds, adminId, clientInfo = {}) {
        const assignments = [];
        const totalTokensNeeded = hotelIds.length * scheduleIds.length;

        // Validate all hotels have sufficient tokens
        for (const hotelId of hotelIds) {
            await this.validateHotelTokens(hotelId, scheduleIds.length);
        }

        // Prepare assignments
        for (const hotelId of hotelIds) {
            for (const scheduleId of scheduleIds) {
                // Check if assignment already exists
                const existing = await Voucher.findByHotelAndSchedule(hotelId, scheduleId);
                if (!existing) {
                    const schedule = await Schedule.findById(scheduleId);
                    if (schedule) {
                        assignments.push({
                            hotelId,
                            moduleId: schedule.module_id,
                            scheduleId,
                            zoomLink: schedule.zoom_link
                        });
                    }
                }
            }
        }

        if (assignments.length === 0) {
            throw new Error('No new assignments to create. All hotels are already assigned to these schedules.');
        }

        // Create bulk assignments
        const voucherIds = await Voucher.createBulkHotelAssignments(assignments);

        // Deduct tokens for each hotel
        const tokensByHotel = {};
        for (const assignment of assignments) {
            tokensByHotel[assignment.hotelId] = (tokensByHotel[assignment.hotelId] || 0) + 1;
        }

        for (const [hotelId, tokenCount] of Object.entries(tokensByHotel)) {
            await this.deductHotelTokens(parseInt(hotelId), tokenCount, null, `Bulk Hotel Schedule Assignment (${tokenCount} schedules)`);
        }

        // Audit log
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'CREATE',
                entity_type: 'hotel_schedule_bulk',
                entity_id: null,
                new_values: { hotel_ids: hotelIds, schedule_ids: scheduleIds, count: assignments.length },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }

        return { created: voucherIds.length, voucherIds };
    }

    // Bulk assign by date range
    static async createBulkAssignmentsByDateRange(hotelIds, startDate, endDate, adminId, clientInfo = {}) {
        // Get all schedules in date range
        const [schedules] = await db.execute(
            'SELECT id FROM training_schedules WHERE date >= ? AND date <= ? ORDER BY date ASC',
            [startDate, endDate]
        );

        if (schedules.length === 0) {
            throw new Error('No schedules found in the specified date range');
        }

        const scheduleIds = schedules.map(s => s.id);

        // Use bulk assignment method
        return await this.createBulkAssignments(hotelIds, scheduleIds, adminId, clientInfo);
    }

    // Remove assignment and refund token
    static async removeAssignment(assignmentId, adminId, clientInfo = {}) {
        // Get assignment details
        const assignment = await Voucher.findById(assignmentId);
        if (!assignment) {
            throw new Error('Assignment not found');
        }

        // Delete assignment
        await Voucher.deleteHotelAssignment(assignmentId);

        // Refund token
        await this.refundHotelTokens(assignment.hotel_id, 1, assignmentId, 'Hotel Schedule Assignment Removed');

        // Audit log
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'DELETE',
                entity_type: 'hotel_schedule',
                entity_id: assignmentId,
                old_values: { hotel_id: assignment.hotel_id, schedule_id: assignment.schedule_id },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }
}

module.exports = HotelScheduleService;
