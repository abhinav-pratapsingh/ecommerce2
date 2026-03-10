const express = require("express");
const { getAllCategories } = require("../controllers/adminController");

const router = express.Router();

// Public route — customers can browse categories
router.get("/", getAllCategories);

module.exports = router;
