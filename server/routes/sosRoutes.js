const express = require("express");
const router = express.Router();
const { createSOS, getAllSOS ,getMyRequests ,updateSOSStatus,getVolunteerHistory,assignTask,getVolunteers,acceptTask} = require("../controllers/sosController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createSOS);
router.get("/", protect, getAllSOS);
router.get("/my", protect, getMyRequests);
router.put('/:id/status', protect, updateSOSStatus);
router.get("/history", protect, getVolunteerHistory); 
router.put("/assign", protect, assignTask); 
router.get("/volunteers-list", protect, getVolunteers);
router.put("/:id/accept", protect, acceptTask);
module.exports = router;