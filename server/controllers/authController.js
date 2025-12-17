const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ADMIN_CREDENTIALS = {
  email: "admin@resqlink.com",
  password: "admin#123" 
};

// --- HELPER: Generate JWT Token ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || "victim", // Default to victim if no role provided
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login General User (Victim/Volunteer/Donor)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if it is the Hardcoded Admin trying to login here
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
       return res.json({
        _id: "0000-ADMIN-ID", 
        fullName: "System Administrator",
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
        token: generateToken("0000-ADMIN-ID"),
      });
    }

    // 2. Otherwise, check MongoDB for normal users
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Specific Admin Login (Optional: if you want a separate route)
// @route   POST /api/auth/admin-login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    res.json({
      _id: "0000-ADMIN-ID",
      fullName: "System Administrator",
      email: ADMIN_CREDENTIALS.email,
      role: "admin",
      token: generateToken("0000-ADMIN-ID"),
    });
  } else {
    res.status(401).json({ message: "Invalid Admin Credentials" });
  }
};

module.exports = { registerUser, loginUser, loginAdmin };