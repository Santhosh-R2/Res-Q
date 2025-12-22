const express = require("express");
const router = express.Router();
const { 
  createResourceRequest, 
  getMyResources,
  getAllResources
} = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createResourceRequest); 
router.get("/my", protect, getMyResources);        
router.get("/", protect, getAllResources);      
module.exports = router;