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

    static async createHotel(name, tokenQuota, gdriveLink, adminId, clientInfo = {}) {
        const hotelId = await Hotel.create(name, tokenQuota, gdriveLink);

        // Log creation
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'CREATE',
                entity_type: 'hotel',
                entity_id: hotelId,
                new_values: { name, token_quota: tokenQuota, gdrive_link: gdriveLink },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }

        return hotelId;
    }

    static async updateHotel(id, data, adminId, clientInfo = {}) {
        // Get old values for audit log
        const oldHotel = await Hotel.findById(id);
        if (!oldHotel) throw new Error('Hotel not found');

        await Hotel.update(id, data);

        // Log update
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'UPDATE',
                entity_type: 'hotel',
                entity_id: id,
                old_values: { name: oldHotel.name, token_quota: oldHotel.token_quota, gdrive_link: oldHotel.gdrive_link },
                new_values: data,
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }

    static async deleteHotel(id, adminId, clientInfo = {}) {
        // Get hotel data before deletion for audit log
        const hotel = await Hotel.findById(id);
        if (!hotel) throw new Error('Hotel not found');

        await Hotel.delete(id);

        // Log deletion
        if (adminId) {
            await AuditLog.create({
                admin_id: adminId,
                admin_email: clientInfo.admin_email,
                action: 'DELETE',
                entity_type: 'hotel',
                entity_id: id,
                old_values: { name: hotel.name, token_quota: hotel.token_quota },
                ip_address: clientInfo.ip_address,
                user_agent: clientInfo.user_agent
            });
        }
    }
}

module.exports = HotelService;
