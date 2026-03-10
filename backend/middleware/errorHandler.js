/**
 * Global Error Handler Middleware
 * Normalizes all errors into a consistent API response shape.
 * Handles Mongoose errors, JWT errors, and custom ApiErrors.
 */

const { ApiError } = require("../utils/apiUtils");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // ── Mongoose: Invalid ObjectId ─────────────────────────────────────────────
  if (err.name === "CastError") {
    error = new ApiError(404, `Resource not found with id: ${err.value}`);
  }

  // ── Mongoose: Duplicate key ────────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(409, `Duplicate value for field '${field}': ${value}`);
  }

  // ── Mongoose: Validation errors ────────────────────────────────────────────
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  // ── JWT: Invalid token ─────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token. Please log in again.");
  }

  // ── JWT: Expired token ─────────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Your token has expired. Please log in again.");
  }

  // ── Log non-operational errors in production ───────────────────────────────
  if (process.env.NODE_ENV === "production" && !error.isOperational) {
    console.error("PROGRAMMING ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }

  // ── Send error response ────────────────────────────────────────────────────
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
