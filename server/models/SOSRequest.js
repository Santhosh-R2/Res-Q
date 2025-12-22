const mongoose = require("mongoose");

const SOSRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    
    type: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    status: { type: String, default: "pending" },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
      accuracy: Number,
    },
    requiredItems: [{
      item: String,
      status: { type: String, default: "pending" } 
    }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

SOSRequestSchema.virtual('linkedResources', {
  ref: 'ResourceRequest',
  localField: '_id',
  foreignField: 'sosId'
});

SOSRequestSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SOSRequest", SOSRequestSchema);