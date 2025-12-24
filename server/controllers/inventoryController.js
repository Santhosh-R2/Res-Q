const Inventory = require("../models/Inventory");

// @desc Get All Inventory
const getInventory = async (req, res) => {
  try {
    // Standard find, sorted by newest
    const items = await Inventory.find().sort({ createdAt: -1 });
    
    // ALWAYS return an array, even if empty
    res.status(200).json(items || []);
  } catch (error) {
    console.error("Fetch Inventory Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Add Item
const addInventory = async (req, res) => {
  try {
    const { itemName, category, quantity, unit } = req.body;
    
    // Status Logic
    let status = 'In Stock';
    if (Number(quantity) === 0) status = 'Out of Stock';
    else if (Number(quantity) < 10) status = 'Low Stock';

    const newItem = await Inventory.create({ 
      itemName, 
      category, 
      quantity: Number(quantity),
      unit, 
      status 
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Add Inventory Error:", error);
    res.status(500).json({ message: "Failed to add item" });
  }
};

// @desc Update Quantity
const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    
    if(!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;
    
    if (item.quantity <= 0) item.status = 'Out of Stock';
    else if (item.quantity < 10) item.status = 'Low Stock';
    else item.status = 'In Stock';

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// @desc Delete Item
const deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

module.exports = { getInventory, addInventory, updateStock, deleteItem };