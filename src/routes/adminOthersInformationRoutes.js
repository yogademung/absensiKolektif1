const express = require('express');
const router = express.Router();
const AdminOthersInformationController = require('../controllers/adminOthersInformationController');
const authAdmin = require('../middleware/authAdmin');

router.use(authAdmin);

router.get('/', AdminOthersInformationController.getAll);
router.get('/:id', AdminOthersInformationController.getById);
router.post('/', AdminOthersInformationController.create);
router.put('/:id', AdminOthersInformationController.update);
router.delete('/:id', AdminOthersInformationController.delete);

module.exports = router;
