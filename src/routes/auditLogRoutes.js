const express = require('express');
const AuditLogController = require('../controllers/auditLogController');
const authAdmin = require('../middleware/authAdmin');

const router = express.Router();

router.use(authAdmin); // Protect all routes

router.get('/', AuditLogController.getAll);
router.get('/:entity_type/:entity_id', AuditLogController.getByEntity);

module.exports = router;
