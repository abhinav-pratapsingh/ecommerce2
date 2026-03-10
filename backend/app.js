/**
 * Express Application Configuration
 * Sets up middleware, security headers, rate limiting,
 * and mounts all API routes.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// CORS — allow frontend origin with credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Stricter rate limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
});
app.use("/api/auth", authLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────

// Razorpay webhook needs raw body — mount BEFORE express.json()
app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Data Sanitization ──────────────────────────────────────────────────────

// Sanitize data against NoSQL injection attacks
app.use(mongoSanitize());

// Sanitize data against XSS attacks
app.use(xssClean());

// Prevent HTTP parameter pollution
app.use(
  hpp({
    whitelist: ["price", "rating", "category", "brand", "stock"],
  })
);

// ─── Logging ─────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── API Routes ──────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "eCommerce API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
