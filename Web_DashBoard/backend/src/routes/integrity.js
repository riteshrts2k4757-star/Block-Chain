const express = require('express');
const router = express.Router();
const integrityController = require('../controllers/integrity.controller');

// GET integrity chain blocks
router.get('/blocks', integrityController.getBlocks);

// GET integrity statistics
router.get('/stats', integrityController.getStats);

// POST verify chain
router.post('/verify', integrityController.verifyChain);

// GET offline recovery events
router.get('/recovery', integrityController.getRecoveryEvents);

// DELETE reset logs
router.delete('/reset', integrityController.resetLogs);

// POST create demo record
router.post('/demo', integrityController.createDemoRecord);

module.exports = router;
