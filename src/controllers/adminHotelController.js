const HotelService = require('../services/hotelService');
const response = require('../utils/response');

class AdminHotelController {
    static async getAll(req, res) {
        try {
            const hotels = await HotelService.getAllHotels();
            return response(res, 200, true, 'Hotels retrieved', hotels);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async create(req, res) {
        try {
            const { name, token_quota, gdrive_link, overhandle_form_link } = req.body;
            if (!name) return response(res, 400, false, 'Name is required');

            const adminId = req.admin?.id; // From authAdmin middleware
            const clientInfo = req.clientInfo;
            const id = await HotelService.createHotel(name, token_quota || 0, gdrive_link || null, overhandle_form_link || null, adminId, clientInfo);
            return response(res, 201, true, 'Hotel created', { id });
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, token_quota, gdrive_link, overhandle_form_link } = req.body;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            await HotelService.updateHotel(id, { name, token_quota, gdrive_link, overhandle_form_link }, adminId, clientInfo);
            return response(res, 200, true, 'Hotel updated');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;

            await HotelService.deleteHotel(id, adminId, clientInfo);
            return response(res, 200, true, 'Hotel deleted');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = AdminHotelController;
