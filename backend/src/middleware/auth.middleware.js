const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// Ensure JWT_SECRET is loaded consistently (e.g., from a central config or directly from process.env)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-dev-only';

if (JWT_SECRET === 'fallback-secret-key-dev-only' && process.env.NODE_ENV === 'production') {
    logger.warn('CRITICAL: Using fallback JWT secret in auth.middleware! Please set JWT_SECRET environment variable.');
}

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) { // Note the space after Bearer
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded.user; // Add user payload (e.g., { id: user.id, email: user.email }) to request object
            next();
        } catch (error) {
            logger.error('Token verification failed:', {
                errorMessage: error.message,
                tokenProvided: !!token, // Log if a token was found but failed verification
                // errorName: error.name // e.g., JsonWebTokenError, TokenExpiredError
            });
            // Send a generic error message. Specifics (like expired token) logged for backend, not exposed to client.
            return res.status(401).json({ status: 'error', message: 'Not authorized, token processing failed.' });
        }
    } else if (req.query.token) { // Allow token in query params as an alternative (less secure for GET, but can be useful)
        try {
            token = req.query.token as string;
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded.user;
            next();
        } catch (error) {
            logger.error('Token verification from query param failed:', { errorMessage: error.message });
            return res.status(401).json({ status: 'error', message: 'Not authorized, token processing failed.' });
        }
    }


    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Not authorized, no token provided.' });
    }
};

const userFromToken = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded.user; // Make user available on the request
        } catch (error) {
            // Token is invalid or expired, clear req.user or do nothing, let it proceed as anonymous
            req.user = null;
            logger.info('Optional auth: Invalid or expired token, proceeding as anonymous.', { errorName: error.name });
        }
    } else if (req.query.token) { // Support token from query as well for this optional middleware
         try {
            token = req.query.token as string;
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded.user;
        } catch (error) {
            req.user = null;
            logger.info('Optional auth from query: Invalid or expired token, proceeding as anonymous.', { errorName: error.name });
        }
    }
    next(); // Always call next, as this middleware is optional
};

module.exports = { protect, userFromToken };
