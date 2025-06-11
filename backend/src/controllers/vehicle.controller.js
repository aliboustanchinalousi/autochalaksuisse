const vehicleModel = require('../models/vehicle.model');
const logger = require('../config/logger');

const createVehicle = async (req, res, next) => {
    const { make, model, year_of_manufacture, price, mileage, seller_id } = req.body;

    // Basic validation
    if (!make || !model || !year_of_manufacture || price === undefined || mileage === undefined || seller_id === undefined) {
        logger.warn('Create vehicle attempt with missing required fields:', { body: req.body });
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields: make, model, year_of_manufacture, price, mileage, seller_id are required.'
        });
    }

    try {
        const newVehicle = await vehicleModel.create(req.body);
        res.status(201).json({ status: 'success', data: newVehicle });
    } catch (error) {
        logger.error('Error in createVehicle controller:', error);
        next(error); // Pass to global error handler
    }
};

const getAllVehicles = async (req, res, next) => {
    try {
        // Extract filters and pagination params from req.query
        const {
            make, model, year_of_manufacture, price_min, price_max, status_filter, fuel_type, transmission_type,
            limit, offset, sort_by, sort_order
        } = req.query;

        const filters = {
            make, model, year_of_manufacture, price_min, price_max, status_filter, fuel_type, transmission_type,
            limit, offset, sort_by, sort_order
        };

        // Remove undefined keys from filters to avoid issues in model
        Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

        const { vehicles, total_count } = await vehicleModel.findAll(filters);

        const page = Math.floor((parseInt(filters.offset, 10) || 0) / (parseInt(filters.limit, 10) || 20)) + 1;
        const page_size = parseInt(filters.limit, 10) || 20;
        const total_pages = Math.ceil(total_count / page_size);

        res.status(200).json({
            status: 'success',
            data: vehicles,
            meta: {
                total_count,
                page,
                page_size,
                total_pages,
            }
        });
    } catch (error) {
        logger.error('Error in getAllVehicles controller:', error);
        next(error);
    }
};

const getVehicleById = async (req, res, next) => {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10))) {
        logger.warn(`Attempt to get vehicle with invalid ID format: ${id}`);
        return res.status(400).json({ status: 'error', message: 'Vehicle ID must be an integer.' });
    }
    try {
        const vehicle = await vehicleModel.findById(parseInt(id, 10));
        if (!vehicle) {
            logger.warn(`Vehicle not found with id: ${id}`);
            return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
        }
        res.status(200).json({ status: 'success', data: vehicle });
    } catch (error) {
        logger.error(`Error in getVehicleById controller for id ${id}:`, error);
        next(error);
    }
};

const updateVehicle = async (req, res, next) => {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10))) {
        logger.warn(`Attempt to update vehicle with invalid ID format: ${id}`);
        return res.status(400).json({ status: 'error', message: 'Vehicle ID must be an integer.' });
    }

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ status: 'error', message: 'No update data provided.' });
    }

    // Add specific field validation if necessary, e.g. ensuring price is a number
    if (req.body.price !== undefined && isNaN(parseFloat(req.body.price))) {
        return res.status(400).json({ status: 'error', message: 'Price must be a valid number.'});
    }
    if (req.body.year_of_manufacture !== undefined && (isNaN(parseInt(req.body.year_of_manufacture,10)) || String(req.body.year_of_manufacture).length !== 4) ) {
         return res.status(400).json({ status: 'error', message: 'Year of manufacture must be a valid 4-digit year.'});
    }


    try {
        const updatedVehicle = await vehicleModel.update(parseInt(id, 10), req.body);
        if (!updatedVehicle) {
            logger.warn(`Vehicle not found for update with id: ${id}`);
            return res.status(404).json({ status: 'error', message: 'Vehicle not found or no changes made' });
        }
        res.status(200).json({ status: 'success', data: updatedVehicle });
    } catch (error) {
        logger.error(`Error in updateVehicle controller for id ${id}:`, error);
        next(error);
    }
};

const deleteVehicle = async (req, res, next) => {
    const { id } = req.params;
     if (isNaN(parseInt(id, 10))) {
        logger.warn(`Attempt to delete vehicle with invalid ID format: ${id}`);
        return res.status(400).json({ status: 'error', message: 'Vehicle ID must be an integer.' });
    }
    try {
        const result = await vehicleModel.remove(parseInt(id, 10));
        if (!result) {
            logger.warn(`Vehicle not found for deletion with id: ${id}`);
            return res.status(404).json({ status: 'error', message: 'Vehicle not found or already deleted' });
        }
        res.status(200).json({ status: 'success', message: 'Vehicle marked as deleted successfully', data: result });
    } catch (error) {
        logger.error(`Error in deleteVehicle controller for id ${id}:`, error);
        next(error);
    }
};

module.exports = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
};
