const express = require('express');
const VoucherController = require('../controllers/voucherController');

const router = express.Router();

router.post('/', VoucherController.create);
router.get('/history/:hotelId', VoucherController.getHistory);
router.get('/:id', VoucherController.get);

module.exports = router;
