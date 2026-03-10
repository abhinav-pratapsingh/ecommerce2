/**
 * User Model
 * Handles user authentication data, roles, and profile information.
 * Passwords are hashed with bcrypt before saving.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { generateToken } = require("../utils/jwtUtils");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: "US" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isMobilePhone(v, "any"),
        message: "Please provide a valid phone number",
      },
    },
    address: addressSchema,
    avatar: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save Hook: Hash password ─────────────────────────────────────────────

userSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Update passwordChangedAt when password changes (not on creation)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // 1s buffer for JWT timing
  }

  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plain-text password with the hashed password in DB.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate a signed JWT token for this user.
 */
userSchema.methods.getSignedToken = function () {
  return generateToken({ id: this._id, role: this.role });
};

/**
 * Check if password was changed after a JWT was issued.
 * @param {number} jwtTimestamp - iat from JWT payload
 */
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedAt;
  }
  return false;
};

// ─── Index ────────────────────────────────────────────────────────────────────
module.exports = mongoose.model("User", userSchema);
