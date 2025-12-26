const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

    const userPayload = {
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: userRole,
    };

    if (location && location.lat && location.lng) {
      userPayload.location = {
        type: "Point",
        coordinates: [location.lng, location.lat]
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
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.phone && req.body.phone !== user.phone) {
        const phoneExists = await User.findOne({
          phone: req.body.phone,
          _id: { $ne: user._id }
        });

        if (phoneExists) {
          return res.status(400).json({ message: "Phone number is already registered with another account" });
        }
      }

      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      if (req.body.role) user.role = req.body.role;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone, 
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ResQLink Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset OTP - ResQLink",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
            <div style="background-color: #d32f2f; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ResQLink</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px;">Emergency Response Network</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; text-align: center;">Password Reset Request</h2>
              <p style="line-height: 1.6; color: #6b7280; text-align: center; margin-bottom: 30px;">
                We received a request to reset your password. Use the verification code below to proceed. This code is valid for 10 minutes.
              </p>
              <div style="background-color: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #d32f2f;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                If you did not request this, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2025 ResQLink Tactical Systems</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Reset failed" });
  }
};
module.exports = { registerUser, loginUser, loginAdmin, updateUserProfile, getAllUsers, deleteUser, updateUserRoleAdmin, resetPassword, forgotPassword };