const express = require("express");
const router = express.Router();
const { 
  createResourceRequest, 
  getMyResources,
  getAllResources,
  fulfillRequest,
  getMyDonations,
  updateResourceStatus,
  getLogisticsTasks,
  approveResourceRequest,
  rejectResourceRequest,
  getDistributionHistory
} = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createResourceRequest); 
router.get("/my", protect, getMyResources);        
router.get("/", protect, getAllResources);     
router.put("/:id/fulfill", protect, fulfillRequest); 
router.get("/donations", protect, getMyDonations);
router.put("/:id/status", protect, updateResourceStatus);
router.get("/logistics", protect, getLogisticsTasks);
router.put("/:id/approve", protect, approveResourceRequest);
router.put('/:id/reject', protect, rejectResourceRequest);
router.get('/distribution-history', protect, getDistributionHistory);
module.exports = router;