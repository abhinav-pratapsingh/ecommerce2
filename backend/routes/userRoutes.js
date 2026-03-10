const express = require("express");
const { getProfile, updateProfile, changePassword } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get("/profile", getProfile);
router.put("/update", upload.single("avatar"), updateProfile);
router.put("/change-password", changePassword);

module.exports = router;
