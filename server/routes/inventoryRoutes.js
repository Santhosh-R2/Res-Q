const express = require("express");
const router = express.Router();
const { getInventory, addInventory, updateStock, deleteItem } = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware"); // Optional for testing

// If you want to test without login first, remove 'protect' temporarily
router.get("/", protect, getInventory);
router.post("/", protect, addInventory);
router.put("/:id", protect, updateStock);
router.delete("/:id", protect, deleteItem);

module.exports = router;