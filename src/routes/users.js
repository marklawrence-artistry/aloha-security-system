// ================================================
// FILE: src/routes/users.js
// ================================================
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Protect all these routes with verifyAdmin
router.get('/', verifyToken, verifyAdmin, userController.getUsers);
router.post('/', verifyToken, verifyAdmin, userController.createUser);
router.put('/:id', verifyToken, verifyAdmin, userController.updateUser);
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);

module.exports = router;