const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Food', 'Water', 'Medical', 'Clothing', 'Equipment', 'Other'],
      required: true 
    },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // e.g. "kg", "liters", "boxes"
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);