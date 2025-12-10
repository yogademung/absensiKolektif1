const OthersInformationService = require('../services/othersInformationService');
const response = require('../utils/response');

class AdminOthersInformationController {
    static async getAll(req, res) {
        try {
            const { type } = req.query;
            const data = type
                ? await OthersInformationService.getByType(type)
                : await OthersInformationService.getAll();
            return response(res, 200, true, 'Information retrieved', data);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await OthersInformationService.getById(id);
            return response(res, 200, true, 'Information retrieved', data);
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async create(req, res) {
        try {
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;
            const id = await OthersInformationService.create(req.body, adminId, clientInfo);
            return response(res, 201, true, 'Information created', { id });
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;
            await OthersInformationService.update(id, req.body, adminId, clientInfo);
            return response(res, 200, true, 'Information updated');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.admin?.id;
            const clientInfo = req.clientInfo;
            await OthersInformationService.delete(id, adminId, clientInfo);
            return response(res, 200, true, 'Information deleted');
        } catch (error) {
            return response(res, 500, false, error.message);
        }
    }
}

module.exports = AdminOthersInformationController;
