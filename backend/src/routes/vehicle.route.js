const express = require('express');
const vehicleController = require('../controllers/vehicle.controller');
// const { isAuthenticated, isAuthorized } = require('../middleware/auth.middleware'); // Example for future auth

const router = express.Router();

// Create a new vehicle listing
// Future: Add isAuthenticated and potentially isAuthorized(['seller', 'admin'])
router.post('/', vehicleController.createVehicle);

// Get all vehicle listings (publicly accessible, or add auth if needed)
router.get('/', vehicleController.getAllVehicles);

// Get a single vehicle listing by ID (publicly accessible)
router.get('/:id', vehicleController.getVehicleById);

// Update a vehicle listing
// Future: Add isAuthenticated and isAuthorized (e.g., owner or admin)
router.put('/:id', vehicleController.updateVehicle);

// Delete a vehicle listing (soft delete)
// Future: Add isAuthenticated and isAuthorized (e.g., owner or admin)
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
