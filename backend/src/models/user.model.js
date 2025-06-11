const { query: dbQuery } = require('../config/database'); // Assuming pool.query is exported as 'query'
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

const create = async (userData) => {
    const { email, password, full_name } = userData;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
        INSERT INTO users (email, password_hash, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, full_name, created_at;
    `;
    const values = [email, password_hash, full_name];
    try {
        const { rows } = await dbQuery(query, values);
        logger.info(`User created with id: ${rows[0].id}, email: ${rows[0].email}`);
        return rows[0];
    } catch (error) {
        logger.error('Error creating user in model:', {
            errorCode: error.code,
            errorMessage: error.message,
            detail: error.detail, // Often contains useful info like which constraint was violated
            // query, // Be cautious logging queries with sensitive data in production
            // values: [email, ' HASHED_PASSWORD ', full_name] // Log non-sensitive parts or placeholders
        });
        // Check for unique constraint violation (email already exists)
        if (error.code === '23505') { // PostgreSQL unique violation code
            throw new Error('User with this email already exists.');
        }
        throw error; // Re-throw original or a new generic error
    }
};

const findByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1;';
    try {
        const { rows } = await dbQuery(query, [email]);
        return rows[0];
    } catch (error) {
        logger.error(`Error finding user by email ${email} in model:`, error);
        throw error;
    }
};

const comparePassword = async (candidatePassword, passwordHash) => {
    if (!candidatePassword || !passwordHash) {
        logger.warn('comparePassword called with missing candidatePassword or passwordHash');
        return false;
    }
    return bcrypt.compare(candidatePassword, passwordHash);
};

module.exports = { create, findByEmail, comparePassword };
