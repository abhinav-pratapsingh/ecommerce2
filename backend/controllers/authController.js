/**
 * Auth Controller
 * Handles user registration, login, logout, and profile retrieval.
 */

const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");
const { sendTokenCookie, clearTokenCookie } = require("../utils/jwtUtils");

// ─── Register ─────────────────────────────────────────────────────────────────

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new ApiError(409, "An account with this email already exists."));
  }

  const user = await User.create({ name, email: normalizedEmail, password, phone });

  const token = user.getSignedToken();
  sendTokenCookie(res, token);

  // Don't return sensitive data
  user.password = undefined;

  ApiResponse.success(res, 201, "Account created successfully", {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return next(new ApiError(400, "Please provide both email and password."));
  }

  // Explicitly select password (it's hidden by default)
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    // Generic message to prevent user enumeration
    return next(new ApiError(401, "Invalid email or password."));
  }

  if (!user.isActive) {
    return next(new ApiError(401, "Your account has been deactivated. Contact support."));
  }

  const token = user.getSignedToken();
  sendTokenCookie(res, token);

  user.password = undefined;

  ApiResponse.success(res, 200, "Logged in successfully", {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

exports.logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  ApiResponse.success(res, 200, "Logged out successfully");
});

// ─── Get Profile ──────────────────────────────────────────────────────────────

exports.getProfile = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  const user = await User.findById(req.user._id);
  ApiResponse.success(res, 200, "Profile retrieved", { user });
});
