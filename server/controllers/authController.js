const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// --- CONFIG: Hardcoded Admin Credentials ---
const ADMIN_CREDENTIALS = {
  email: "admin@resqlink.com",
  password: "admin#123" 
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role ? role.toLowerCase() : "victim", 
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

// @desc    Login & Update Role Dynamically
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body; 

    // --- 1. ADMIN CHECK ---
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
       return res.json({
        _id: "0000-ADMIN-ID", 
        fullName: "System Administrator",
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
        token: generateToken("0000-ADMIN-ID"),
      });
    }

    // --- 2. FIND USER ---
    const user = await User.findOne({ email });

    // --- 3. VERIFY PASSWORD ---
    if (user && (await bcrypt.compare(password, user.password))) {
      
      console.log(`[LOGIN] User: ${user.email} | Current DB Role: ${user.role}`);

      // --- 4. ROLE UPDATE LOGIC (Using .save() method) ---
      if (role) {
        const requestedRole = role.toLowerCase().trim();
        const currentRole = user.role.toLowerCase();
        
        // Allowed roles to switch to
        const validRoles = ['victim', 'volunteer', 'donor'];

        // Logic:
        // 1. Check if requested role is valid
        // 2. Check if it is different from current
        // 3. SECURITY: Prevent downgrading an 'admin' account via this form
        if (validRoles.includes(requestedRole) && currentRole !== requestedRole) {
          
          if (currentRole === 'admin') {
             console.log("Security Alert: Attempt to downgrade Admin prevented.");
          } else {
             console.log(`>>> UPDATING ROLE IN DB: ${currentRole} -> ${requestedRole}`);
             
             // UPDATE THE INSTANCE DIRECTLY
             user.role = requestedRole;
             
             // SAVE TO DB (This triggers Mongoose validation and ensures persistence)
             await user.save();
             
             console.log(">>> DB SAVE SUCCESSFUL");
          }
        }
      }

      // --- 5. SEND RESPONSE ---
      // The 'user' object is now the updated version because we modified it directly above
      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role, 
        phone: user.phone,
      
        token: generateToken(user._id),
      });

    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Admin Specific Login
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
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;
    if (req.body.role) user.role = req.body.role; // Allow role update

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
module.exports = { registerUser, loginUser, loginAdmin, updateUserProfile };