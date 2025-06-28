// backend/middleware/errorMiddleware.js

// 404 Not Found
exports.notFound = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(err);
};

// General error handler
exports.errorHandler = (err, req, res, next) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message: err.message,
    // include stack only in dev
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
