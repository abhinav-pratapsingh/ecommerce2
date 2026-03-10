/**
 * Admin Controller
 * Admin-only operations: manage products, categories, orders, users, and analytics.
 */

const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const User = require("../models/User");
const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");
const { uploadImage, deleteImage } = require("../config/cloudinary");
const { bufferToDataURI } = require("../middleware/uploadMiddleware");

// ══════════════════════════════════════════════
//  PRODUCT MANAGEMENT
// ══════════════════════════════════════════════

exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, brand, stock } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    stock,
    images: [],
    createdBy: req.user._id,
  });

  ApiResponse.success(res, 201, "Product created successfully", { product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    "name", "description", "price", "category", "brand",
    "stock", "isFeatured", "isActive",
  ];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!product) return next(new ApiError(404, "Product not found."));

  ApiResponse.success(res, 200, "Product updated", { product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ApiError(404, "Product not found."));

  // Delete all images from Cloudinary
  for (const img of product.images) {
    if (img.public_id) await deleteImage(img.public_id);
  }

  // Remove associated reviews
  await Review.deleteMany({ product: product._id });

  await product.deleteOne();

  ApiResponse.success(res, 200, "Product and associated data deleted successfully");
});

exports.uploadProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ApiError(400, "Please upload at least one image."));
  }

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ApiError(404, "Product not found."));

  if (product.images.length + req.files.length > 10) {
    return next(new ApiError(400, `Cannot exceed 10 images per product. Currently has ${product.images.length}.`));
  }

  const uploadedImages = [];

  for (const file of req.files) {
    const dataURI = bufferToDataURI(file);
    const result = await uploadImage(dataURI, "ecommerce/products");
    uploadedImages.push(result);
  }

  product.images.push(...uploadedImages);
  await product.save();

  ApiResponse.success(res, 200, "Images uploaded successfully", {
    images: product.images,
  });
});

exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const { productId, publicId } = req.body;

  const product = await Product.findById(productId);
  if (!product) return next(new ApiError(404, "Product not found."));

  // Delete from Cloudinary
  await deleteImage(publicId);

  // Remove from product document
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  ApiResponse.success(res, 200, "Image deleted", { images: product.images });
});

exports.adminGetAllProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  ApiResponse.success(res, 200, "Products retrieved", { products }, {
    total, page, limit, pages: Math.ceil(total / limit),
  });
});

// ══════════════════════════════════════════════
//  CATEGORY MANAGEMENT
// ══════════════════════════════════════════════

exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  let imageData = {};
  if (req.file) {
    const dataURI = bufferToDataURI(req.file);
    imageData = await uploadImage(dataURI, "ecommerce/categories");
  }

  const category = await Category.create({
    name,
    description,
    image: imageData,
  });

  ApiResponse.success(res, 201, "Category created", { category });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.description) updates.description = req.body.description;

  if (req.file) {
    const existing = await Category.findById(req.params.id);
    if (existing?.image?.public_id) await deleteImage(existing.image.public_id);
    const dataURI = bufferToDataURI(req.file);
    updates.image = await uploadImage(dataURI, "ecommerce/categories");
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });

  if (!category) return next(new ApiError(404, "Category not found."));

  ApiResponse.success(res, 200, "Category updated", { category });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ApiError(404, "Category not found."));

  // Prevent deletion if products are using this category
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return next(new ApiError(400, `Cannot delete: ${productCount} product(s) are using this category.`));
  }

  if (category.image?.public_id) await deleteImage(category.image.public_id);

  await category.deleteOne();

  ApiResponse.success(res, 200, "Category deleted");
});

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  ApiResponse.success(res, 200, "Categories retrieved", { categories });
});

// ══════════════════════════════════════════════
//  ORDER MANAGEMENT
// ══════════════════════════════════════════════

exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.userId) filter.user = req.query.userId;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  ApiResponse.success(res, 200, "Orders retrieved", { orders }, {
    total, page, limit, pages: Math.ceil(total / limit),
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus, trackingNumber } = req.body;

  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(orderStatus)) {
    return next(new ApiError(400, `Invalid order status. Must be one of: ${validStatuses.join(", ")}`));
  }

  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, "Order not found."));

  // Prevent rolling back delivered orders
  if (order.orderStatus === "delivered" && orderStatus !== "delivered") {
    return next(new ApiError(400, "Cannot change status of a delivered order."));
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === "shipped") order.shippedAt = new Date();
  if (orderStatus === "delivered") order.deliveredAt = new Date();
  if (orderStatus === "cancelled") order.cancelledAt = new Date();

  await order.save();

  ApiResponse.success(res, 200, "Order status updated", { order });
});

// ══════════════════════════════════════════════
//  USER MANAGEMENT
// ══════════════════════════════════════════════

exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  ApiResponse.success(res, 200, "Users retrieved", { users }, {
    total, page, limit, pages: Math.ceil(total / limit),
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const allowedFields = ["role", "isActive", "name", "phone"];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  // Prevent admin from demoting themselves
  if (req.params.id === req.user._id.toString() && updates.role === "customer") {
    return next(new ApiError(400, "You cannot change your own role."));
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });

  if (!user) return next(new ApiError(404, "User not found."));

  ApiResponse.success(res, 200, "User updated", { user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Prevent admin from deleting themselves
  if (req.params.id === req.user._id.toString()) {
    return next(new ApiError(400, "You cannot delete your own account."));
  }

  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError(404, "User not found."));

  // Soft delete instead of hard delete (preserve order history)
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`; // Free up the email
  await user.save();

  ApiResponse.success(res, 200, "User account deactivated");
});

// ══════════════════════════════════════════════
//  ANALYTICS / STATS
// ══════════════════════════════════════════════

exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueData,
    ordersByStatus,
    recentOrders,
    topProducts,
    monthlySales,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),

    // Total revenue from paid orders
    Order.aggregate([
      { $match: { "paymentInfo.status": "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]),

    // Order count grouped by status
    Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),

    // 5 most recent orders
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("totalPrice orderStatus createdAt user"),

    // Top 5 most ordered products
    Order.aggregate([
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.product", name: { $first: "$orderItems.name" }, totalSold: { $sum: "$orderItems.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),

    // Monthly revenue for last 6 months
    Order.aggregate([
      {
        $match: {
          "paymentInfo.status": "paid",
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  // Normalize ordersByStatus into an object
  const statusMap = {};
  ordersByStatus.forEach(({ _id, count }) => {
    statusMap[_id] = count;
  });

  ApiResponse.success(res, 200, "Stats retrieved", {
    overview: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    },
    ordersByStatus: statusMap,
    recentOrders,
    topProducts,
    monthlySales,
  });
});
