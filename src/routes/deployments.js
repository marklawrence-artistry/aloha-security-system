const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, deploymentController.deployGuard);
router.get('/', verifyToken, deploymentController.getDeployments);
router.put('/:id', verifyToken, deploymentController.updateDeploymentStatus);
router.delete('/:id', verifyToken, deploymentController.deleteDeployment);
router.get('/report/pdf', verifyToken, deploymentController.generateReport);

module.exports = router;