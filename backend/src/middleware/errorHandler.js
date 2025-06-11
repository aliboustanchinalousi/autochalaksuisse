const logger = require('../config/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error details
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: statusCode,
      isOperational: err.isOperational // Custom property to distinguish operational errors
    },
    request: {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      headers: req.headers,
      body: req.body // Be cautious logging request bodies, especially if they contain sensitive data
    }
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optionally include stack in development
  });
};

module.exports = errorHandler;
