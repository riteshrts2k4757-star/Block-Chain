const express = require('express');
const router = express.Router();
const controller = require('../controllers/loadProfiles.controller');

router.get('/', controller.getProfiles);
router.get('/active', controller.getActiveProfile);
router.post('/', controller.createProfile);
router.put('/:id', controller.updateProfile);
router.delete('/:id', controller.deleteProfile);
router.put('/:id/active', controller.setActiveProfile);

module.exports = router;
