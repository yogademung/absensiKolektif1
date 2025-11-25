const VoucherService = require('../services/voucherService');
const response = require('../utils/response');

class VoucherController {
    static async create(req, res) {
        try {
            const result = await VoucherService.createVoucher(req.body);
            return response(res, 201, true, 'Voucher created successfully', result);
        } catch (error) {
            return response(res, 400, false, error.message);
        }
    }

    static async get(req, res) {
        try {
            const { id } = req.params;
            const voucher = await VoucherService.getVoucher(id);
            return response(res, 200, true, 'Voucher details', voucher);
        } catch (error) {
            return response(res, 404, false, error.message);
        }
    }
}

module.exports = VoucherController;
