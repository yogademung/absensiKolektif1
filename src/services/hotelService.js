const Hotel = require('../models/Hotel');
const AuditLog = require('../models/AuditLog');

class HotelService {
    static async getAllHotels() {
        return await Hotel.findAll();
    }

    static async getHotelById(id) {
        const hotel = await Hotel.findById(id);
        if (!hotel) throw new Error('Hotel not found');
        return hotel;
    }

    static async createHotel(name, tokenQuota, adminId) {
        const hotelId = await Hotel.create(name, tokenQuota);

        // Log creation
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'CREATE',
                entity_type: 'hotel',
                entity_id: hotelId,
                new_values: { name, token_quota: tokenQuota }
            });
        }

        return hotelId;
    }

    static async updateHotel(id, data, adminId) {
        // Get old values for audit log
        const oldHotel = await Hotel.findById(id);
        if (!oldHotel) throw new Error('Hotel not found');

        await Hotel.update(id, data);

        // Log update
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'UPDATE',
                entity_type: 'hotel',
                entity_id: id,
                old_values: { name: oldHotel.name, token_quota: oldHotel.token_quota },
                new_values: data
            });
        }
    }

    static async deleteHotel(id, adminId) {
        // Get hotel data before deletion for audit log
        const hotel = await Hotel.findById(id);
        if (!hotel) throw new Error('Hotel not found');

        await Hotel.delete(id);

        // Log deletion
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                action: 'DELETE',
                entity_type: 'hotel',
                entity_id: id,
                old_values: { name: hotel.name, token_quota: hotel.token_quota }
            });
        }
    }
}

module.exports = HotelService;
