/**
 * ApiError — Custom error class for operational API errors.
 * These are expected errors (404, 400, 401) that should be
 * communicated clearly to the client.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Marks error as safe to expose to client
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ApiResponse — Consistent success response shape.
 */
class ApiResponse {
  /**
   * Send a success response.
   * @param {object} res - Express response
   * @param {number} statusCode
   * @param {string} message
   * @param {object} data
   * @param {object} meta - Pagination or extra metadata
   */
  static success(res, statusCode = 200, message = "Success", data = {}, meta = {}) {
    const payload = { success: true, message, data };
    if (Object.keys(meta).length > 0) payload.meta = meta;
    return res.status(statusCode).json(payload);
  }
}

module.exports = { ApiError, ApiResponse };
