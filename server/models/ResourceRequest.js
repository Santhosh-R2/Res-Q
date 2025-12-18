const mongoose = require("mongoose");

const ResourceRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sosId: { type: mongoose.Schema.Types.ObjectId, ref: "SOSRequest", default: null },
    
    // --- UPDATED: Renamed 'type' to 'itemCategory' for safety ---
    items: [
      {
        itemCategory: { type: String, required: true }, 
        quantity: { type: String, required: true }
      }
    ],
    
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    notes: { type: String },
    status: { type: String, default: "pending" },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResourceRequest", ResourceRequestSchema);