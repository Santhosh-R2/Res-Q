const ResourceRequest = require("../models/ResourceRequest");
const User = require("../models/User");

const createResourceRequest = async (req, res) => {
  try {
    const { items, urgency, notes, sosId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Please add at least one item." });
    }

    const user = await User.findById(req.user._id);

    const newRequest = await ResourceRequest.create({
      userId: req.user._id,
      sosId: sosId || null,
      items: items, 
      urgency,
      notes,
      status: "pending",
      location: user.location || { type: "Point", coordinates: [0, 0] }
    });

    res.status(201).json({ success: true, data: newRequest });

  } catch (error) {
    console.error("Resource Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getMyResources = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching" });
  }
};
const getAllResources = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ status: "pending" })
      .populate("userId", "fullName phone") 
      .sort({ urgency: -1, createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = { createResourceRequest, getMyResources ,getAllResources}; 