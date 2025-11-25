const express = require('express');
const AdminModuleController = require('../controllers/adminModuleController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.use(authAdmin); // Protect all routes

router.get('/', AdminModuleController.getAll);
router.post('/', AdminModuleController.create);
router.put('/:id', AdminModuleController.update);
router.delete('/:id', AdminModuleController.delete);

module.exports = router;
