const mongoose = require("mongoose");

const SOSRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: [true, "Emergency type is required"], // e.g., Fire, Medical
      enum: ['Medical', 'Fire', 'Flood', 'Collapse', 'Violence', 'Other']
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // We will store the Base64 string directly for simplicity (or cloud URL)
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "resolved", "cancelled"],
      default: "pending",
    },
    // GeoJSON Location format (Crucial for geospatial queries)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      accuracy: Number,
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Index for Geospatial Queries (Find nearest SOS)
SOSRequestSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SOSRequest", SOSRequestSchema);