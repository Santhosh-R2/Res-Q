const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
   role: {
    type: String,
    enum: ['victim', 'volunteer', 'donor', 'admin'], // <--- CHECK THESE VALUES
    default: 'victim',
  },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, 
    },
  },
  { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);