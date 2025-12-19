const express = require("express");
const router = express.Router();
const { createSOS, getAllSOS ,getMyRequests ,updateSOSStatus,getVolunteerHistory} = require("../controllers/sosController");
const { protect } = require("../middleware/authMiddleware");

// Both routes need the user to be logged in (protect middleware)
router.post("/", protect, createSOS);
router.get("/", protect, getAllSOS);
router.get("/my", protect, getMyRequests);
router.put('/:id/status', protect, updateSOSStatus);
router.get("/history", protect, getVolunteerHistory); // <--- MOVE THIS UP
module.exports = router;