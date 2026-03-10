/**
 * Cart Controller
 * Manages the user's shopping cart (add, update, remove, view).
 */

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");

// ─── Get Cart ─────────────────────────────────────────────────────────────────

exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "name price images stock isActive",
  });

  if (!cart) {
    cart = { user: req.user._id, items: [], totalPrice: 0, totalItems: 0 };
  }

  ApiResponse.success(res, 200, "Cart retrieved", { cart });
});

// ─── Add to Cart ──────────────────────────────────────────────────────────────

exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) return next(new ApiError(400, "Product ID is required."));
  if (quantity < 1) return next(new ApiError(400, "Quantity must be at least 1."));

  // Validate product exists and has enough stock
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) return next(new ApiError(404, "Product not found."));
  if (product.stock < quantity) {
    return next(new ApiError(400, `Only ${product.stock} units available in stock.`));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create a new cart
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity, price: product.price }],
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists in cart — update quantity
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (newQty > product.stock) {
        return next(new ApiError(400, `Cannot add more. Only ${product.stock} units available.`));
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = product.price; // Refresh price snapshot
    } else {
      // New item — add to cart
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
  }

  await cart.populate({ path: "items.product", select: "name price images stock" });

  ApiResponse.success(res, 200, "Item added to cart", { cart });
});

// ─── Update Cart Item ─────────────────────────────────────────────────────────

exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return next(new ApiError(400, "Product ID and quantity are required."));
  }

  if (quantity < 1) return next(new ApiError(400, "Quantity must be at least 1."));

  const product = await Product.findById(productId);
  if (!product) return next(new ApiError(404, "Product not found."));
  if (product.stock < quantity) {
    return next(new ApiError(400, `Only ${product.stock} units available in stock.`));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError(404, "Cart not found."));

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex === -1) return next(new ApiError(404, "Item not found in cart."));

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate({ path: "items.product", select: "name price images stock" });

  ApiResponse.success(res, 200, "Cart updated", { cart });
});

// ─── Remove from Cart ─────────────────────────────────────────────────────────

exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError(404, "Cart not found."));

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  ApiResponse.success(res, 200, "Item removed from cart", { cart });
});

// ─── Clear Cart ───────────────────────────────────────────────────────────────

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true }
  );

  ApiResponse.success(res, 200, "Cart cleared");
});
