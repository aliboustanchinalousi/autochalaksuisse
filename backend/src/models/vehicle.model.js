const { query: dbQuery } = require('../config/database'); // Assuming pool.query is exported as 'query'
const logger = require('../config/logger');

const create = async (vehicleData) => {
    const {
        make, model, year_of_manufacture, price, mileage,
        fuel_type, transmission_type, description, image_urls,
        location, seller_id, status
    } = vehicleData;

    const imageUrlsToStore = Array.isArray(image_urls) ? JSON.stringify(image_urls) : image_urls || '[]';

    const sql = `
        INSERT INTO vehicles
            (make, model, year_of_manufacture, price, mileage, fuel_type, transmission_type,
            description, image_urls, location, seller_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
    `;
    const values = [
        make, model, year_of_manufacture, price, mileage, fuel_type, transmission_type,
        description, imageUrlsToStore, location, seller_id, status || 'available'
    ];

    try {
        const { rows } = await dbQuery(sql, values);
        logger.info(`Vehicle created with id: ${rows[0].id}`);
        return rows[0];
    } catch (error) {
        logger.error('Error creating vehicle in model:', { error: error.message, stack: error.stack, query: sql, values });
        throw error;
    }
};

const findAll = async (filters = {}) => {
    let sql = 'SELECT * FROM vehicles WHERE status != $1';
    const values = ['deleted'];
    let placeholderIndex = 2;

    if (filters.make) {
        sql += ` AND make ILIKE $${placeholderIndex++}`;
        values.push(`%${filters.make}%`);
    }
    if (filters.model) {
        sql += ` AND model ILIKE $${placeholderIndex++}`;
        values.push(`%${filters.model}%`);
    }
    if (filters.year_of_manufacture) {
        sql += ` AND year_of_manufacture = $${placeholderIndex++}`;
        values.push(parseInt(filters.year_of_manufacture, 10));
    }
    if (filters.price_min) {
        sql += ` AND price >= $${placeholderIndex++}`;
        values.push(parseFloat(filters.price_min));
    }
    if (filters.price_max) {
        sql += ` AND price <= $${placeholderIndex++}`;
        values.push(parseFloat(filters.price_max));
    }
    if (filters.status_filter && filters.status_filter !== 'deleted') { // Allow filtering by other statuses
        sql += ` AND status = $${placeholderIndex++}`;
        values.push(filters.status_filter);
    }
     if (filters.fuel_type) {
        sql += ` AND fuel_type ILIKE $${placeholderIndex++}`;
        values.push(`%${filters.fuel_type}%`);
    }
    if (filters.transmission_type) {
        sql += ` AND transmission_type ILIKE $${placeholderIndex++}`;
        values.push(`%${filters.transmission_type}%`);
    }


    sql += ` ORDER BY ${filters.sort_by || 'created_at'} ${filters.sort_order || 'DESC'}`;

    if (filters.limit) {
        sql += ` LIMIT $${placeholderIndex++}`;
        values.push(parseInt(filters.limit, 10));
    } else { // Default limit
        sql += ` LIMIT $${placeholderIndex++}`;
        values.push(20);
    }

    if (filters.offset) {
        sql += ` OFFSET $${placeholderIndex++}`;
        values.push(parseInt(filters.offset, 10));
    } else { // Default offset
        sql += ` OFFSET $${placeholderIndex++}`;
        values.push(0);
    }
    sql += ';';

    try {
        const { rows } = await dbQuery(sql, values);
        // Also fetch total count for pagination purposes, without limit/offset
        let countSql = 'SELECT COUNT(*) FROM vehicles WHERE status != $1';
        const countValues = ['deleted'];
        let countPlaceholderIndex = 2;
        if (filters.make) { countSql += ` AND make ILIKE $${countPlaceholderIndex++}`; countValues.push(`%${filters.make}%`); }
        if (filters.model) { countSql += ` AND model ILIKE $${countPlaceholderIndex++}`; countValues.push(`%${filters.model}%`); }
        if (filters.year_of_manufacture) { countSql += ` AND year_of_manufacture = $${countPlaceholderIndex++}`; countValues.push(parseInt(filters.year_of_manufacture,10)); }
        if (filters.price_min) { countSql += ` AND price >= $${countPlaceholderIndex++}`; countValues.push(parseFloat(filters.price_min)); }
        if (filters.price_max) { countSql += ` AND price <= $${countPlaceholderIndex++}`; countValues.push(parseFloat(filters.price_max)); }
        if (filters.status_filter && filters.status_filter !== 'deleted') { countSql += ` AND status = $${countPlaceholderIndex++}`; countValues.push(filters.status_filter); }
        if (filters.fuel_type) { countSql += ` AND fuel_type ILIKE $${countPlaceholderIndex++}`; countValues.push(`%${filters.fuel_type}%`); }
        if (filters.transmission_type) { countSql += ` AND transmission_type ILIKE $${countPlaceholderIndex++}`; countValues.push(`%${filters.transmission_type}%`); }
        countSql += ';';

        const countResult = await dbQuery(countSql, countValues);
        const total_count = parseInt(countResult.rows[0].count, 10);

        return { vehicles: rows, total_count };

    } catch (error) {
        logger.error('Error finding all vehicles in model:', { error: error.message, stack: error.stack, query: sql, values });
        throw error;
    }
};

const findById = async (id) => {
    const sql = 'SELECT * FROM vehicles WHERE id = $1 AND status != $2;';
    try {
        const { rows } = await dbQuery(sql, [id, 'deleted']);
        return rows[0];
    } catch (error) {
        logger.error(`Error finding vehicle by id ${id} in model:`, { error: error.message, stack: error.stack, query: sql, values: [id, 'deleted'] });
        throw error;
    }
};

const update = async (id, updateData) => {
    const {
        make, model, year_of_manufacture, price, mileage,
        fuel_type, transmission_type, description, image_urls,
        location, status
    } = updateData;

    const imageUrlsToUpdate = Array.isArray(image_urls) ? JSON.stringify(image_urls) : image_urls;

    const fields = [];
    const values = [];
    let placeholderIndex = 1;

    if (make !== undefined) { fields.push(`make = $${placeholderIndex++}`); values.push(make); }
    if (model !== undefined) { fields.push(`model = $${placeholderIndex++}`); values.push(model); }
    if (year_of_manufacture !== undefined) { fields.push(`year_of_manufacture = $${placeholderIndex++}`); values.push(year_of_manufacture); }
    if (price !== undefined) { fields.push(`price = $${placeholderIndex++}`); values.push(price); }
    if (mileage !== undefined) { fields.push(`mileage = $${placeholderIndex++}`); values.push(mileage); }
    if (fuel_type !== undefined) { fields.push(`fuel_type = $${placeholderIndex++}`); values.push(fuel_type); }
    if (transmission_type !== undefined) { fields.push(`transmission_type = $${placeholderIndex++}`); values.push(transmission_type); }
    if (description !== undefined) { fields.push(`description = $${placeholderIndex++}`); values.push(description); }
    if (imageUrlsToUpdate !== undefined) { fields.push(`image_urls = $${placeholderIndex++}`); values.push(imageUrlsToUpdate); }
    if (location !== undefined) { fields.push(`location = $${placeholderIndex++}`); values.push(location); }
    if (status !== undefined) { fields.push(`status = $${placeholderIndex++}`); values.push(status); }

    if (fields.length === 0) {
        logger.warn(`No fields to update for vehicle id ${id}. Fetching current record.`);
        return findById(id); // Or throw an error: new Error('No fields provided for update');
    }

    values.push(id);

    const sql = `
        UPDATE vehicles
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${placeholderIndex} AND status != 'deleted'
        RETURNING *;
    `;
    try {
        const { rows } = await dbQuery(sql, values);
        logger.info(`Vehicle updated with id: ${id}`);
        return rows[0];
    } catch (error) {
        logger.error(`Error updating vehicle id ${id} in model:`, { error: error.message, stack: error.stack, query: sql, values });
        throw error;
    }
};

const remove = async (id) => {
    const sql = `
        UPDATE vehicles
        SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status != 'deleted'
        RETURNING id, status;
    `;
    try {
        const { rows } = await dbQuery(sql, [id]);
        if (rows.length > 0) {
            logger.info(`Vehicle soft-deleted with id: ${id}`);
        } else {
            logger.warn(`Attempted to soft-delete vehicle id ${id}, but it was not found or already deleted.`);
        }
        return rows[0];
    } catch (error) {
        logger.error(`Error soft-deleting vehicle id ${id} in model:`, { error: error.message, stack: error.stack, query: sql, values: [id] });
        throw error;
    }
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    remove
};
