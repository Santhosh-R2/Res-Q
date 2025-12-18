const SOSRequest = require("../models/SOSRequest");
const User = require("../models/User");

// @desc    Create a new SOS Alert
// @route   POST /api/sos
// @access  Private (Logged in users only)
const createSOS = async (req, res) => {
  try {
    const { location, emergencyType, description, image } = req.body;

    // 1. Basic Validation
    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: "GPS Location is mandatory." });
    }
    if (!emergencyType) {
      return res.status(400).json({ message: "Emergency Type is required." });
    }

    // 2. Create the SOS Entry
    const sosEntry = await SOSRequest.create({
      userId: req.user._id, // Comes from authMiddleware
      type: emergencyType,
      description,
      image, // Saving Base64 string directly (Consider Cloudinary for production)
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat], // MongoDB uses [Longitude, Latitude] order
        accuracy: location.accuracy,
      },
      status: "pending",
    });

    // 3. (Optional) Update User's last known location
    await User.findByIdAndUpdate(req.user._id, {
        location: {
            type: "Point",
            coordinates: [location.lng, location.lat]
        }
    });

    res.status(201).json({
      success: true,
      message: "SOS Broadcasted Successfully",
      data: sosEntry,
    });

  } catch (error) {
    console.error("SOS Error:", error);
    res.status(500).json({ message: "Failed to broadcast signal." });
  }
};

// @desc    Get all active SOS (For Dashboard/Map)
// @route   GET /api/sos
// @access  Private
const getAllSOS = async (req, res) => {
  try {
    const alerts = await SOSRequest.find({ status: "pending" })
      .populate("userId", "fullName phone") // Add user details
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMyRequests = async (req, res) => {
  try {
    const requests = await SOSRequest.find({ userId: req.user._id })
      .populate('linkedResources') // <--- This attaches the items array!
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching requests" });
  }
};

module.exports = { createSOS, getAllSOS ,getMyRequests};