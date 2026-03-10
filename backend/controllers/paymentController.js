/**
 * Payment Controller
 * Handles Razorpay order creation and webhook processing.
 */

const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");
const { ApiError, ApiResponse } = require("../utils/apiUtils");

const DEFAULT_CURRENCY = process.env.RAZORPAY_CURRENCY || "INR";

// ─── Create Razorpay Order ────────────────────────────────────────────────────

exports.processPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) return next(new ApiError(400, "Order ID is required."));

  const order = await Order.findById(orderId);

  if (!order) return next(new ApiError(404, "Order not found."));

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, "Access denied."));
  }

  if (order.paymentInfo?.status === "paid") {
    return next(new ApiError(400, "This order has already been paid."));
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100), // Razorpay uses paise
    currency: DEFAULT_CURRENCY,
    receipt: `order_${order._id}`,
    notes: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.paymentInfo.razorpayOrderId = razorpayOrder.id;
  order.paymentInfo.method = "razorpay";
  await order.save();

  ApiResponse.success(res, 200, "Razorpay order created", {
    keyId: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  });
});

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────

// Verify Razorpay payment from client callback
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new ApiError(400, "Missing Razorpay verification fields."));
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return next(new ApiError(400, "Invalid Razorpay signature."));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new ApiError(404, "Order not found."));

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, "Access denied."));
  }

  order.paymentInfo.status = "paid";
  order.paymentInfo.paidAt = new Date();
  order.paymentInfo.razorpayOrderId = razorpay_order_id;
  order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
  order.paymentInfo.method = "razorpay";
  order.orderStatus = "processing";
  await order.save();

  ApiResponse.success(res, 200, "Payment verified", { orderId: order._id });
});

exports.razorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = req.body; // raw buffer

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return res.status(500).json({ success: false, message: "Webhook secret not configured." });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (!signature || signature !== expected) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature." });
  }

  let event;
  try {
    event = JSON.parse(body.toString("utf8"));
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid webhook payload." });
  }

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload?.payment?.entity;
      await handlePaymentSuccess(payment);
      break;
    }
    case "payment.failed": {
      const payment = event.payload?.payment?.entity;
      await handlePaymentFailure(payment);
      break;
    }
    case "refund.processed": {
      const refund = event.payload?.refund?.entity;
      await handleRefund(refund);
      break;
    }
    default:
      break;
  }

  res.status(200).json({ received: true });
};

// ─── Internal Webhook Handlers ────────────────────────────────────────────────

const handlePaymentSuccess = async (payment) => {
  if (!payment?.order_id) return;

  try {
    const order = await Order.findOne({
      "paymentInfo.razorpayOrderId": payment.order_id,
    });

    if (!order) {
      console.error(`Order not found for Razorpay order: ${payment.order_id}`);
      return;
    }

    order.paymentInfo.status = "paid";
    order.paymentInfo.paidAt = new Date();
    order.paymentInfo.razorpayPaymentId = payment.id;
    order.orderStatus = "processing";

    await order.save();
    console.log(`✅ Payment confirmed for order: ${order._id}`);
  } catch (error) {
    console.error(`Error processing payment success: ${error.message}`);
  }
};

const handlePaymentFailure = async (payment) => {
  if (!payment?.order_id) return;

  try {
    const order = await Order.findOne({
      "paymentInfo.razorpayOrderId": payment.order_id,
    });

    if (order) {
      order.paymentInfo.status = "failed";
      order.paymentInfo.razorpayPaymentId = payment.id || order.paymentInfo.razorpayPaymentId;
      await order.save();
      console.warn(`⚠️  Payment failed for order: ${order._id}`);
    }
  } catch (error) {
    console.error(`Error processing payment failure: ${error.message}`);
  }
};

const handleRefund = async (refund) => {
  if (!refund?.payment_id) return;

  try {
    const order = await Order.findOne({
      "paymentInfo.razorpayPaymentId": refund.payment_id,
    });

    if (order) {
      order.paymentInfo.status = "refunded";
      order.paymentInfo.razorpayRefundId = refund.id;
      await order.save();
      console.log(`💸 Refund processed for order: ${order._id}`);
    }
  } catch (error) {
    console.error(`Error processing refund: ${error.message}`);
  }
};
