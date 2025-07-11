// backend/middleware/validateMiddleware.js
const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 400 Bad Request with array of { msg, param, ... }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
