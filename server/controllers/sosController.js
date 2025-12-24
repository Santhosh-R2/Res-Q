const SOSRequest = require("../models/SOSRequest");
const User = require("../models/User");

const createSOS = async (req, res) => {
  try {
    const { location, emergencyType, description, image ,requiredItems } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: "GPS Location is mandatory." });
    }
    if (!emergencyType) {
      return res.status(400).json({ message: "Emergency Type is required." });
    }

    const sosEntry = await SOSRequest.create({
      userId: req.user._id, 
      type: emergencyType,
      description,
      image, 
       requiredItems: requiredItems || [],
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat], 
        accuracy: location.accuracy,
      },
      status: "pending",
    });

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

const getAllSOS = async (req, res) => {
  try {
    const alerts = await SOSRequest.find({ status: { $ne: 'resolved' } })
      .populate("userId", "fullName phone")
      .populate("assignedVolunteer", "fullName phone") 
      .populate("linkedResources")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
     res.status(500).json({ message: error.message });
   }
};
const getAllSOSAnalytics = async (req, res) => {
  try {
    // No filter = returns pending, accepted, resolved, cancelled
    const allAlerts = await SOSRequest.find({})
      .select('type status createdAt location') // Select only needed fields for speed
      .sort({ createdAt: -1 });

    res.json(allAlerts);
  } catch (error) {
    res.status(500).json({ message: "Analytics Error" });
  }
};
const getMyRequests = async (req, res) => {
  try {
    const requests = await SOSRequest.find({ userId: req.user._id })
      .populate('linkedResources') 
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching requests" });
  }
};
const updateSOSStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sos = await SOSRequest.findById(req.params.id);

    if (!sos) return res.status(404).json({ message: "SOS not found" });

    sos.status = status;

    if (status === 'accepted') {
      sos.assignedVolunteer = req.user._id; 
    }

    if (status === 'pending') {
      sos.assignedVolunteer = undefined;
    }

    await sos.save();
    
    const updatedSos = await SOSRequest.findById(sos._id)
      .populate("userId", "fullName phone")
      .populate("assignedVolunteer", "fullName phone");

    res.json(updatedSos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};
const getVolunteerHistory = async (req, res) => {
  try {
    const history = await SOSRequest.find({ assignedVolunteer: req.user._id })
      .populate("userId", "fullName phone")
      .sort({ updatedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
const assignTask = async (req, res) => {
  try {
    const { sosId, volunteerId } = req.body;

    const sos = await SOSRequest.findById(sosId);
    if (!sos) return res.status(404).json({ message: "Task not found" });

    sos.assignedVolunteer = volunteerId;
    sos.status = "accepted"; 
    await sos.save();

    res.json({ message: "Task Assigned Successfully", sos });
  } catch (error) {
    res.status(500).json({ message: "Assignment Failed" });
  }
};
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('fullName email phone');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteers" });
  }
};
const acceptTask = async (req, res) => {
  try {
    const sos = await SOSRequest.findById(req.params.id);
    
    if (!sos) return res.status(404).json({ message: "Task not found" });
    if (sos.assignedVolunteer) return res.status(400).json({ message: "Task already taken" });

    sos.assignedVolunteer = req.user._id;
    sos.status = "accepted";
    await sos.save();

    res.json(sos);
  } catch (error) {
    res.status(500).json({ message: "Failed to accept task" });
  }
};
module.exports = { createSOS, getAllSOS ,getMyRequests,updateSOSStatus,getVolunteerHistory,assignTask,getVolunteers ,acceptTask,getAllSOSAnalytics};