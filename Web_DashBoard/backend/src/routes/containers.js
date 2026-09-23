const express = require('express');
const router = express.Router();
const containersController = require('../controllers/containers.controller');

router.get('/', containersController.getContainers);

module.exports = router;
