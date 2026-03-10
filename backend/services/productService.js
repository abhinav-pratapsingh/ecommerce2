/**
 * Product Service
 * Business logic for product operations, inventory management,
 * and stock validation.
 */

const Product = require("../models/Product");

/**
 * Decrement stock for multiple products in a single operation.
 * Used after a successful order placement.
 * @param {Array} orderItems - [{ product: ObjectId, quantity: number }]
 */
exports.decrementStock = async (orderItems) => {
  const bulkOps = orderItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product, stock: { $gte: item.quantity } },
      update: { $inc: { stock: -item.quantity } },
    },
  }));

  const result = await Product.bulkWrite(bulkOps);
  return result;
};

/**
 * Increment stock (e.g., when an order is cancelled).
 * @param {Array} orderItems - [{ product: ObjectId, quantity: number }]
 */
exports.incrementStock = async (orderItems) => {
  const bulkOps = orderItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { stock: item.quantity } },
    },
  }));

  return Product.bulkWrite(bulkOps);
};

/**
 * Get low stock products (stock below threshold).
 * @param {number} threshold - Stock level to alert on
 */
exports.getLowStockProducts = async (threshold = 10) => {
  return Product.find({ stock: { $lte: threshold }, isActive: true })
    .populate("category", "name")
    .sort({ stock: 1 })
    .select("name stock price category");
};
