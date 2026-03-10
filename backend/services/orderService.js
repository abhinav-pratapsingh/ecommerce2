/**
 * Order Service
 * Encapsulates business logic for order processing,
 * separated from the controller for testability and reuse.
 */

const Order = require("../models/Order");
const Product = require("../models/Product");

const TAX_RATE = 0.08;
const SHIPPING_RATE = 10;
const FREE_SHIPPING_THRESHOLD = 100;

/**
 * Calculate order pricing breakdown.
 * @param {Array} items - Array of { product, quantity }
 * @returns {object} { itemsPrice, taxPrice, shippingPrice, totalPrice }
 */
exports.calculateOrderPricing = (items) => {
  const itemsPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

/**
 * Validate that all items in a cart have sufficient stock.
 * @param {Array} cartItems - Populated cart items with product ref
 * @returns {object} { valid: boolean, error: string|null }
 */
exports.validateCartStock = (cartItems) => {
  for (const item of cartItems) {
    if (!item.product || !item.product.isActive) {
      return { valid: false, error: `Product "${item.product?.name}" is no longer available.` };
    }
    if (item.product.stock < item.quantity) {
      return {
        valid: false,
        error: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available.`,
      };
    }
  }
  return { valid: true, error: null };
};

/**
 * Get order revenue statistics for a given time period.
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<object>}
 */
exports.getRevenueForPeriod = async (startDate, endDate) => {
  const result = await Order.aggregate([
    {
      $match: {
        "paymentInfo.status": "paid",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$totalPrice" },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
};
