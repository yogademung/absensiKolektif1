const express = require('express');
const AdminManagementController = require('../controllers/adminManagementController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.use(authAdmin); // Protect all routes

router.get('/', AdminManagementController.getAll);
router.post('/', AdminManagementController.create);
router.delete('/:id', AdminManagementController.delete);

module.exports = router;
