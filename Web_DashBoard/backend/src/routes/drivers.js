const express = require('express');
const router = express.Router();
const driversController = require('../controllers/drivers.controller');

router.get('/', driversController.getDrivers);
router.get('/:id/telemetry', driversController.getDriverTelemetry);

module.exports = router;
