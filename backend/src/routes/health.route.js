const express = require('express');
const logger = require('../config/logger');

const router = express.Router();

router.get('/health', (req, res) => {
  logger.info('API Health check endpoint hit');
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});

module.exports = router;
