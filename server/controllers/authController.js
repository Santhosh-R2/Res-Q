const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ADMIN_CREDENTIALS = {
  email: "admin@resqlink.com",
  password: "admin#123" 
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, location } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role ? role.toLowerCase() : "victim";

    // Create User object with Location
    const userPayload = {
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: userRole,
    };

    // If location provided (lat/lng), save it as GeoJSON
    if (location && location.lat && location.lng) {
      userPayload.location = {
        type: "Point",
        coordinates: [location.lng, location.lat] // MongoDB is [Lng, Lat]
      };
    }

    const user = await User.create(userPayload);

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

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body; 

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
       return res.json({
        _id: "0000-ADMIN-ID", 
        fullName: "System Administrator",
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
        token: generateToken("0000-ADMIN-ID"),
      });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      console.log(`[LOGIN] User: ${user.email} | Current DB Role: ${user.role}`);

      if (role) {
        const requestedRole = role.toLowerCase().trim();
        const currentRole = user.role.toLowerCase();
        
        const validRoles = ['victim', 'volunteer', 'donor'];

        if (validRoles.includes(requestedRole) && currentRole !== requestedRole) {
          
          if (currentRole === 'admin') {
             console.log("Security Alert: Attempt to downgrade Admin prevented.");
          } else {
             console.log(`>>> UPDATING ROLE IN DB: ${currentRole} -> ${requestedRole}`);
             
             user.role = requestedRole;
                          await user.save();
             
             console.log(">>> DB SAVE SUCCESSFUL");
          }
        }
      }

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
    if (req.body.role) user.role = req.body.role; 

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
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
}
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
const updateUserRoleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = req.body.role || user.role;
    await user.save();

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
module.exports = { registerUser, loginUser, loginAdmin, updateUserProfile, getAllUsers, deleteUser,updateUserRoleAdmin };