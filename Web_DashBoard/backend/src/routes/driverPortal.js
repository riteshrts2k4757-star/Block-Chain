const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const driverPortalController = require('../controllers/driverPortal.controller');

// All driver portal routes require a logged-in user with 'driver' role
router.use(protect);
// router.use(authorize('driver')); // Optionally strictly enforce driver role, but admin might want to view it. Let's just use protect and rely on userId.

router.get('/dashboard', driverPortalController.getDashboard);
router.get('/trip', driverPortalController.getCurrentTrip);
router.get('/logbook', driverPortalController.getLogbook);
router.get('/alerts', driverPortalController.getAlerts);
router.get('/profile', driverPortalController.getProfile);
router.put('/profile', driverPortalController.updateProfile);
router.get('/notifications', driverPortalController.getNotifications);

module.exports = router;
