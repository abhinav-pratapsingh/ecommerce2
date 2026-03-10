/**
 * Authentication & Authorization Middleware
 *
 * protect       — Verifies JWT from cookie or Authorization header.
 * authorize     — Restricts access to specific roles (e.g. admin).
 */

const asyncHandler = require("./asyncHandler");
const { ApiError } = require("../utils/apiUtils");
const { verifyToken } = require("../utils/jwtUtils");
const User = require("../models/User");

/**
 * protect middleware
 * Reads JWT from:
 *   1. HTTP-only cookie ("token")
 *   2. Authorization: Bearer <token> header
 * Attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Not authenticated. Please log in."));
  }

  // Verify token
  const decoded = verifyToken(token);

  // Fetch the user from DB to ensure they still exist and are active
  const user = await User.findById(decoded.id).select("+passwordChangedAt");

  if (!user) {
    return next(new ApiError(401, "The user belonging to this token no longer exists."));
  }

  if (!user.isActive) {
    return next(new ApiError(401, "Your account has been deactivated. Contact support."));
  }

  // Check if password changed after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new ApiError(401, "Password was recently changed. Please log in again."));
  }

  // Attach user to request for downstream use
  req.user = user;
  next();
});

/**
 * authorize(...roles)
 * Restricts a route to users with specific roles.
 * Must be used AFTER the protect middleware.
 *
 * Example: router.delete('/users/:id', protect, authorize('admin'), deleteUser)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized for this action.`
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
