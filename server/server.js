const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sosRoutes = require("./routes/sosRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const contactRoutes = require("./routes/contactRoutes");
const Inventory = require("./routes/inventoryRoutes");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors("*")); 
app.use(express.json()); 

app.use("/api/auth", authRoutes);
app.use("/api/sos", sosRoutes); 
app.use("/api/resources", resourceRoutes); 
app.use("/api/contact", contactRoutes);
app.use("/api/inventory", Inventory);

app.get("/", (req, res) => {
  res.send("ResQ-Link API is Running...");
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;