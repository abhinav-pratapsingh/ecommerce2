/**
 * Order Controller
 * Customer-facing order placement and tracking.
 */

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");

const TAX_RATE = 0.08;     // 8% tax
const SHIPPING_RATE = 10;  // Flat $10 shipping (free over $100)
const FREE_SHIPPING_THRESHOLD = 100;

// ─── Create Order ─────────────────────────────────────────────────────────────

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, razorpayOrderId } = req.body;

  if (!shippingAddress) {
    return next(new ApiError(400, "Shipping address is required."));
  }

  // Load user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return next(new ApiError(400, "Your cart is empty."));
  }

  // Validate stock and build order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      return next(new ApiError(400, `Product "${item.product?.name || "Unknown"}" is no longer available.`));
    }

    if (product.stock < item.quantity) {
      return next(new ApiError(400, `Insufficient stock for "${product.name}". Only ${product.stock} left.`));
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // Calculate pricing
  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  // Create the order
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentInfo: razorpayOrderId
      ? {
          razorpayOrderId,
          status: "pending",
          method: "razorpay",
        }
      : { status: "pending" },
  });

  // Decrement stock for each product
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear the cart after order is placed
  await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

  ApiResponse.success(res, 201, "Order placed successfully", { order });
});

// ─── Get My Orders ────────────────────────────────────────────────────────────

exports.getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    Order.countDocuments({ user: req.user._id }),
  ]);

  ApiResponse.success(res, 200, "Orders retrieved", { orders }, {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});

// ─── Get Single Order ─────────────────────────────────────────────────────────

exports.getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ApiError(404, "Order not found."));

  // Ensure the order belongs to the requesting user (unless admin)
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ApiError(403, "Access denied."));
  }

  ApiResponse.success(res, 200, "Order retrieved", { order });
});
