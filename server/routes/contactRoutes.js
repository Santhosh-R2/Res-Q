const express = require("express");
const router = express.Router();
const { submitContactForm, getAllMessages } = require("../controllers/ContactMessage");

router.post("/", submitContactForm);

router.get("/", getAllMessages); 

module.exports = router;