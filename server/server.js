const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const sosRoutes = require("./routes/sosRoutes");
// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors("*")); // Allows frontend to talk to backend
app.use(express.json()); // Allows parsing JSON body

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sos", sosRoutes); // <--- Add this line
// Base Route
app.get("/", (req, res) => {
  res.send("ResQ-Link API is Running...");
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// REQUIRED FOR VERCEL
module.exports = app;