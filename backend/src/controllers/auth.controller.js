const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const logger = require('../config/logger');

// It's best practice to load these from a centralized config that reads .env
// For example, require('../config').jwtSecret or similar
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-dev-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (JWT_SECRET === 'fallback-secret-key-dev-only' && process.env.NODE_ENV === 'production') {
    logger.warn('CRITICAL: Using fallback JWT secret in production! Please set JWT_SECRET environment variable.');
}

const register = async (req, res, next) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }
    // Basic password length validation
    if (password.length < 6) {
        return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters long.' });
    }
    // Basic email format validation (very simple)
    if (!email.includes('@')) {
        return res.status(400).json({ status: 'error', message: 'Invalid email format.' });
    }


    try {
        const newUser = await userModel.create({ email, password, full_name });
        // The model already returns user without password_hash
        res.status(201).json({ status: 'success', data: { user: newUser } });
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ status: 'error', message: error.message });
        }
        logger.error('Registration error in auth.controller:', { errorMessage: error.message, stack: error.stack });
        next(error);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            logger.warn(`Login attempt for non-existent email: ${email}`);
            return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
        }

        const isMatch = await userModel.comparePassword(password, user.password_hash);
        if (!isMatch) {
            logger.warn(`Failed login attempt for email: ${email} (password mismatch)`);
            return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email,
                // role: user.role, // Example: if you add roles to your user model
            },
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Omit password_hash and other sensitive details from user object in response
        const { password_hash, ...userResponse } = user;

        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: userResponse.id,
                    email: userResponse.email,
                    full_name: userResponse.full_name
                }
            },
        });
    } catch (error) {
        logger.error('Login error in auth.controller:', { errorMessage: error.message, stack: error.stack });
        next(error);
    }
};

module.exports = { register, login };
