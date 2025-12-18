const express = require("express");
const router = express.Router();
const { 
  createResourceRequest, 
  getMyResources 
} = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");

// All routes require login
router.post("/", protect, createResourceRequest); // Create Request
router.get("/my", protect, getMyResources);        // View All (For Admin/Volunteer Dash)

module.exports = router;