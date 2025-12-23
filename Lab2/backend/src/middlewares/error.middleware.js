const { logger } = require("../utils/logger");

function errorMiddleware(err, req, res, next) {
  logger.error("Request error:", err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    ok: false,
    message,
  });
}

module.exports = { errorMiddleware };
