// ================================================
// FILE: src/routes/audit.js
// ================================================
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware'); // Import verifyAdmin

// Only Admins can see logs
router.get('/logs', verifyToken, verifyAdmin, auditController.getLogs);

module.exports = router;