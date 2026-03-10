/**
 * User Controller
 * Customer-facing profile management.
 */

const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");
const { uploadImage, deleteImage } = require("../config/cloudinary");
const { bufferToDataURI } = require("../middleware/uploadMiddleware");

// ─── Get Own Profile ──────────────────────────────────────────────────────────

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  ApiResponse.success(res, 200, "Profile retrieved", { user });
});

// ─── Update Profile ───────────────────────────────────────────────────────────

exports.updateProfile = asyncHandler(async (req, res, next) => {
  // Whitelist updatable fields (never allow role/password changes here)
  const allowedFields = ["name", "phone", "address"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Handle avatar upload
  if (req.file) {
    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar && user.avatar.public_id) {
      await deleteImage(user.avatar.public_id);
    }

    const dataURI = bufferToDataURI(req.file);
    const result = await uploadImage(dataURI, "ecommerce/avatars");
    updates.avatar = result;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, 200, "Profile updated successfully", { user });
});

// ─── Change Password ──────────────────────────────────────────────────────────

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ApiError(400, "Please provide both current and new password."));
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    return next(new ApiError(401, "Current password is incorrect."));
  }

  if (newPassword.length < 8) {
    return next(new ApiError(400, "New password must be at least 8 characters."));
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, 200, "Password changed successfully");
});
