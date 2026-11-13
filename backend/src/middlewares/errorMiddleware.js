/**
 * Centralized Error Handling Middleware
 */
function errorMiddleware(err, req, res, next) {
  console.error('[Error caught in errorMiddleware]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorMiddleware;
