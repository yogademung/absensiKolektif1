const Voucher = require('../models/Voucher');
const Hotel = require('../models/Hotel');
const Schedule = require('../models/Schedule');
const TokenLog = require('../models/TokenLog');
const db = require('../config/db'); // For transactions if needed, but we'll keep it simple for now

class VoucherService {
    static async createVoucher(data) {
        const { staff_name, hotel_id, module_id, schedule_id } = data;

        // 1. Check Hotel Quota
        const hotel = await Hotel.findById(hotel_id);
        if (!hotel) throw new Error('Hotel not found');

        // 2. Get Schedule & Zoom Link
        const schedule = await Schedule.findById(schedule_id);
        if (!schedule) throw new Error('Schedule not found');

        // 3. Check if this hotel has already registered for this schedule
        const existingVoucher = await Voucher.findByHotelAndSchedule(hotel_id, schedule_id);
        const isFirstRegistration = !existingVoucher;

        // 4. If first registration, check token quota
        if (isFirstRegistration) {
            const remainingTokens = hotel.token_quota - hotel.token_used;
            if (remainingTokens <= 0) {
                throw new Error('Insufficient tokens');
            }
        }

        // 5. Create Voucher (always create regardless of first or not)
        const tokenCost = isFirstRegistration ? 1 : 0;
        const voucherId = await Voucher.create({
            staff_name,
            hotel_id,
            module_id,
            schedule_id,
            zoom_link: schedule.zoom_link,
            token_cost: tokenCost
        });

        // 6. Update Hotel Token Usage (only for first registration)
        let newTokenUsed = hotel.token_used;
        if (isFirstRegistration) {
            newTokenUsed = hotel.token_used + 1;
            await Hotel.updateTokenUsage(hotel_id, newTokenUsed);
        }

        // 7. Log Token Usage (always log, but with different token_change)
        const tokenChange = isFirstRegistration ? -1 : 0;
        const reason = isFirstRegistration
            ? 'Voucher Registration (First - Token Deducted)'
            : 'Voucher Registration (Additional - No Token Deducted)';
        await TokenLog.create(hotel_id, voucherId, tokenChange, reason);

        return {
            voucherId,
            zoomLink: schedule.zoom_link,
            remainingTokens: hotel.token_quota - newTokenUsed,
            isFirstRegistration
        };
    }

    static async getVoucher(id) {
        const voucher = await Voucher.findById(id);
        if (!voucher) throw new Error('Voucher not found');
        return voucher;
    }
}

module.exports = VoucherService;
