const express = require('express');
const router = express.Router();
const sensorsController = require('../controllers/sensors.controller');

router.post('/data', sensorsController.receiveData);
router.post('/batch', sensorsController.receiveBatchData);
router.get('/:deviceId', sensorsController.getDeviceData);

module.exports = router;
