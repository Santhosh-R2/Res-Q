const ResourceRequest = require("../models/ResourceRequest");
const SOSRequest = require("../models/SOSRequest");
const User = require("../models/User");
const Inventory = require("../models/Inventory");
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

const fulfillRequest = async (req, res) => {
  try {
    const resource = await ResourceRequest.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Not Found" });

    resource.status = 'fulfilled'; 
    resource.donorId = req.user._id; 
    await resource.save();

    res.json({ message: "Pledge Recorded", resource });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

const getMyDonations = async (req, res) => {
  try {
    const donations = await ResourceRequest.find({ donorId: req.user._id })
      .populate('userId', 'fullName phone') 
      .sort({ updatedAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

const updateResourceStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const resource = await ResourceRequest.findById(req.params.id);

    if (!resource) return res.status(404).json({ message: "Not Found" });

    if (status === 'collected') {
        if (resource.status !== 'fulfilled' && resource.status !== 'dispatched') {
            return res.status(400).json({ message: "Item is not ready for pickup yet." });
        }
    }

    if (status === 'delivered') {
        if (resource.status !== 'collected') {
            return res.status(400).json({ message: "Item must be collected first." });
        }
    }

    resource.status = status;
    await resource.save();

    res.json(resource);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Update Failed" });
  }
};

const getLogisticsTasks = async (req, res) => {
  try {
    const myMissions = await SOSRequest.find({ assignedVolunteer: req.user._id }).select('_id');
    const missionIds = myMissions.map(m => m._id);

    const logistics = await ResourceRequest.find({
      $or: [
        { sosId: { $in: missionIds } }, 
        { userId: req.user._id }       
      ],
      status: { $in: ['fulfilled', 'collected', 'delivered', 'dispatched'] } 
    })
    .populate('userId', 'fullName phone') 
    .populate('donorId', 'fullName phone') 
    .sort({ updatedAt: -1 });

    res.json(logistics);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
const approveResourceRequest = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status === 'dispatched') return res.status(400).json({ message: "Already dispatched." });

    for (const item of request.items) {
      const inventoryItem = await Inventory.findOne({ 
        itemName: { $regex: new RegExp(`^${item.itemCategory}$`, "i") } 
      });

      if (!inventoryItem) {
        return res.status(400).json({ 
          message: `Stock Error: Item '${item.itemCategory}' does not exist in Global Inventory.` 
        });
      }

      const qtyRequested = parseInt(item.quantity) || 0; 
      
      if (inventoryItem.quantity < qtyRequested) {
        return res.status(400).json({ 
          message: `Insufficient Stock: Only ${inventoryItem.quantity} ${inventoryItem.unit} of '${item.itemCategory}' available.` 
        });
      }

      inventoryItem.quantity -= qtyRequested;
      
      if (inventoryItem.quantity === 0) inventoryItem.status = 'Out of Stock';
      else if (inventoryItem.quantity < 10) inventoryItem.status = 'Low Stock';
      else inventoryItem.status = 'In Stock';
      
      await inventoryItem.save();
    }

    request.status = 'dispatched';
    await request.save();

    res.json({ message: "Approved & Stock Deducted", request });

  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Server Error during approval" });
  }
};

const rejectResourceRequest = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject. Current status: ${request.status}` });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: "Request rejected successfully", request });
  } catch (error) {
    console.error("Rejection Error:", error);
    res.status(500).json({ message: "Server Error during rejection" });
  }
};
const getDistributionHistory = async (req, res) => {
  try {
    const history = await ResourceRequest.find({ 
      status: { $in: ['dispatched', 'delivered'] } 
    })
    .populate("userId", "fullName email phone")
    .sort({ updatedAt: -1 });

    res.json(history);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ message: "Failed to fetch distribution history" });
  }
};
module.exports = { 
  createResourceRequest, 
  getMyResources, 
  getAllResources,
  fulfillRequest,
  getMyDonations,
  updateResourceStatus,
  getLogisticsTasks,
  approveResourceRequest,
  rejectResourceRequest,
  getDistributionHistory
};