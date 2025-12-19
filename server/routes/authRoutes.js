const express = require("express");
const router = express.Router();
const { registerUser, loginUser, loginAdmin,updateUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin); // <--- Add this line
router.put('/profile', protect, updateUserProfile);
module.exports = router;