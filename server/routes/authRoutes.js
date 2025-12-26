const express = require("express");
const router = express.Router();
const { registerUser, loginUser, loginAdmin,updateUserProfile,getAllUsers,deleteUser,updateUserRoleAdmin,forgotPassword,resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin); 
router.put('/profile', protect, updateUserProfile);
// Admin Routes
router.get('/users', protect, getAllUsers);
router.delete('/users/:id', protect, deleteUser);
router.put('/users/:id', protect, updateUserRoleAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
module.exports = router;