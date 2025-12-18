const mongoose = require("mongoose");

const SOSRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    status: { type: String, default: "pending" },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
      accuracy: Number,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }, // <--- CRITICAL: Include virtuals in JSON response
    toObject: { virtuals: true }
  }
);

// --- VIRTUAL RELATIONSHIP ---
SOSRequestSchema.virtual('linkedResources', {
  ref: 'ResourceRequest', // The model to look into
  localField: '_id',      // Find requests where...
  foreignField: 'sosId'   // ...the 'sosId' matches this SOS's ID
});

SOSRequestSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SOSRequest", SOSRequestSchema);