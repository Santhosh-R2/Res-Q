const express = require("express");
const router = express.Router();
const { 
  submitContactForm, 
  getAllMessages, 
  getMessageById, 
  updateMessageStatus 
} = require("../controllers/contactController");

router.post("/", submitContactForm);

router.get("/", getAllMessages);
router.get("/:id", getMessageById);
router.put("/:id/status", updateMessageStatus);

module.exports = router;