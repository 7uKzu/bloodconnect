import logger from '../config/logger.js';

export function errorHandler(err, req, res, next) { // eslint-disable-line
  logger.error({ message: err.message, stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
}
