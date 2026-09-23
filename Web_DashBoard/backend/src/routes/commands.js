const express = require('express');
const router = express.Router();
const commandsController = require('../controllers/commands.controller');

router.post('/', commandsController.queueCommand);
router.get('/pending/:deviceId', commandsController.getPendingCommands);
router.post('/:commandId/ack', commandsController.acknowledgeCommand);
router.get('/:commandId', commandsController.getCommandStatus);

module.exports = router;
