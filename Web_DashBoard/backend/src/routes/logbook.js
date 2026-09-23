const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbook.controller');

router.get('/:driverId', logbookController.getDriverLogs);
router.post('/', logbookController.createDriverLog);

module.exports = router;
