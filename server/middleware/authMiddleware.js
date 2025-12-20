const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- FIX: HANDLE HARDCODED ADMIN ID ---
      if (decoded.id === "0000-ADMIN-ID") {
        // Manually set the admin user object without checking MongoDB
        req.user = {
          _id: "0000-ADMIN-ID",
          fullName: "System Administrator",
          email: "admin@resqlink.com",
          role: "admin"
        };
        return next(); // Proceed to controller
      }
      // --------------------------------------

      // 3. Normal User Database Lookup
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };