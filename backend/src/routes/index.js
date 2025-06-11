const express = require('express');
const healthRouter = require('./health.route');
const vehicleRouter = require('./vehicle.route'); // Import vehicle routes
const authRouter = require('./auth.route'); // Import auth routes
// Import other routers here as they are created
// const userRoutes = require('./user.routes');
// const productRoutes = require('./product.routes');

const router = express.Router();

// Mount health check routes
router.use('/health', healthRouter); // Explicitly mount health at /api/health

// Mount auth routes
router.use('/auth', authRouter); // Mounts at /api/auth

// Mount vehicle routes
router.use('/vehicles', vehicleRouter); // Mounts at /api/vehicles

// Mount other routers here
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

module.exports = router;
