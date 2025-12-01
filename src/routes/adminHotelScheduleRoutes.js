const express = require('express');
const router = express.Router();
const AdminHotelScheduleController = require('../controllers/adminHotelScheduleController');
const authAdmin = require('../middleware/authAdmin');

// All routes require admin authentication
router.use(authAdmin);

// Get all hotel schedule assignments (optionally filter by hotel_id)
router.get('/', AdminHotelScheduleController.getAll);

// Get schedules for specific hotel
router.get('/hotel/:hotelId', AdminHotelScheduleController.getByHotelId);

// Create single assignment
router.post('/', AdminHotelScheduleController.create);

// Bulk assign hotels to schedules
router.post('/bulk', AdminHotelScheduleController.createBulk);

// Bulk assign by date range
router.post('/bulk-by-date', AdminHotelScheduleController.createBulkByDateRange);

// Remove assignment (refund token)
router.delete('/:id', AdminHotelScheduleController.delete);

module.exports = router;
