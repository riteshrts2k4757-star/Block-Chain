const express = require('express');
const router = express.Router();
const shipmentsController = require('../controllers/shipments.controller');

router.get('/', shipmentsController.getShipments);
router.get('/:id', shipmentsController.getShipmentById);

module.exports = router;
