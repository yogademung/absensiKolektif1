const express = require('express');
const ReportController = require('../controllers/reportController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.use(authAdmin); // Protect all routes

router.get('/schedules', ReportController.getScheduleStats);
router.get('/schedules/:scheduleId', ReportController.getScheduleRegistrations);
router.get('/token-logs', ReportController.getTokenLogs);
router.get('/token-logs/schedule/:scheduleId', ReportController.getTokenLogsBySchedule);
router.get('/token-logs/hotel/:hotelId', ReportController.getTokenLogsByHotel);

module.exports = router;
