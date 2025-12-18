const ResourceRequest = require("../models/ResourceRequest");
const User = require("../models/User");

// @desc    Create Request
// @route   POST /api/resources
const createResourceRequest = async (req, res) => {
  try {
    const { items, urgency, notes, sosId } = req.body;

    // 1. Validate Array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Please add at least one item." });
    }

    const user = await User.findById(req.user._id);

    const newRequest = await ResourceRequest.create({
      userId: req.user._id,
      sosId: sosId || null,
      items: items, // Save the array of objects
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

// ... keep getMyResources and getAllResources ...
const getMyResources = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching" });
  }
};

module.exports = { createResourceRequest, getMyResources }; // Add others if needed