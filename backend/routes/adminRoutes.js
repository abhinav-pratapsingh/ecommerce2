/**
 * Admin Routes
 * All routes are protected and restricted to admin role only.
 */

const express = require("express");
const {
  // Products
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  adminGetAllProducts,
  // Categories
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  // Orders
  getAllOrders,
  updateOrderStatus,
  // Users
  getAllUsers,
  updateUser,
  deleteUser,
  // Analytics
  getStats,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Apply auth + admin check to ALL admin routes
router.use(protect, authorize("admin"));

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get("/stats", getStats);

// ─── Product Management ───────────────────────────────────────────────────────
router.route("/products")
  .get(adminGetAllProducts)
  .post(createProduct);

router.route("/products/:id")
  .put(updateProduct)
  .delete(deleteProduct);

router.post("/products/:id/images", upload.array("images", 10), uploadProductImages);
router.delete("/products/images/remove", deleteProductImage);

// ─── Category Management ──────────────────────────────────────────────────────
router.route("/categories")
  .get(getAllCategories)
  .post(upload.single("image"), createCategory);

router.route("/categories/:id")
  .put(upload.single("image"), updateCategory)
  .delete(deleteCategory);

// ─── Order Management ─────────────────────────────────────────────────────────
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);

// ─── User Management ──────────────────────────────────────────────────────────
router.get("/users", getAllUsers);
router.route("/users/:id")
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
