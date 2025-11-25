const express = require('express');
const AdminScheduleController = require('../controllers/adminScheduleController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.use(authAdmin); // Protect all routes

router.get('/', AdminScheduleController.getAll);
router.post('/', AdminScheduleController.create);
router.put('/:id', AdminScheduleController.update);
router.delete('/:id', AdminScheduleController.delete);

module.exports = router;
