const express = require("express");
const { processPayment, razorpayWebhook, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Webhook must use raw body (set in app.js before json middleware)
router.post("/webhook", razorpayWebhook);
router.post("/verify", protect, verifyPayment);

// Payment intent creation requires auth
router.post("/process", protect, processPayment);

module.exports = router;
