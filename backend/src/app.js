require('dotenv/config');
const express = require('express');
const morgan = require('morgan');
const logger = require('./config/logger');
const mainRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Morgan setup to use Winston for logging HTTP requests
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', mainRouter); // Mount main router

// Error Handling Middleware - should be last
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app; // Export for potential testing or programmatic use
