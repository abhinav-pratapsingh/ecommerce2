/**
 * Review Controller
 * Customers can submit one review per product they've purchased.
 */

const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");

// ─── Create Review ────────────────────────────────────────────────────────────

exports.createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    return next(new ApiError(400, "Product ID, rating, and comment are required."));
  }

  // Verify the product exists
  const product = await Product.findById(productId);
  if (!product) return next(new ApiError(404, "Product not found."));

  // Verify the user has purchased this product (prevent fake reviews)
  const hasPurchased = await Order.exists({
    user: req.user._id,
    "orderItems.product": productId,
    orderStatus: "delivered",
  });

  if (!hasPurchased) {
    return next(new ApiError(403, "You can only review products you have purchased and received."));
  }

  // Check for existing review
  const existingReview = await Review.findOne({ user: req.user._id, product: productId });
  if (existingReview) {
    return next(new ApiError(409, "You have already reviewed this product."));
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  await review.populate("user", "name avatar");

  ApiResponse.success(res, 201, "Review submitted successfully", { review });
});

// ─── Get Product Reviews ──────────────────────────────────────────────────────

exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) return next(new ApiError(404, "Product not found."));

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: productId }),
  ]);

  ApiResponse.success(res, 200, "Reviews retrieved", { reviews }, {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});

// ─── Delete Review ────────────────────────────────────────────────────────────

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new ApiError(404, "Review not found."));

  // Only the review author or admin can delete
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ApiError(403, "Access denied."));
  }

  await Review.findByIdAndDelete(req.params.id);

  ApiResponse.success(res, 200, "Review deleted successfully");
});
