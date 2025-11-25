const express = require('express');
const AdminHotelController = require('../controllers/adminHotelController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.use(authAdmin); // Protect all routes

router.get('/', AdminHotelController.getAll);
router.post('/', AdminHotelController.create);
router.put('/:id', AdminHotelController.update);
router.delete('/:id', AdminHotelController.delete);

module.exports = router;
