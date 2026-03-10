const express = require("express");
const {
  getAllProducts,
  getProductById,
  searchProducts,
} = require("../controllers/productController");

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

module.exports = router;
