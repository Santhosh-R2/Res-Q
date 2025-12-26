const SOSRequest = require("../models/SOSRequest");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const createSOS = async (req, res) => {
  try {
    const { location, emergencyType, description, image, requiredItems } = req.body;

    // ... validations ...
    if (!location || !location.lat || !location.lng) return res.status(400).json({ message: "GPS Location is mandatory." });
    if (!emergencyType) return res.status(400).json({ message: "Emergency Type is required." });

    const sosEntry = await SOSRequest.create({
      userId: req.user._id,
      type: emergencyType,
      description,
      image,
      requiredItems: requiredItems || [],
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
        accuracy: location.accuracy,
      },
      status: "pending",
    });

    await User.findByIdAndUpdate(req.user._id, {
      location: { type: "Point", coordinates: [location.lng, location.lat] }
    });

    // --- START EMAIL BROADCAST LOGIC ---
    // We run this without 'await' so the response is sent to the victim immediately
    broadcastSOSEmail(sosEntry, req.user.fullName);

    res.status(201).json({
      success: true,
      message: "SOS Broadcasted Successfully",
      data: sosEntry,
    });

  } catch (error) {
    console.error("SOS Error:", error);
    res.status(500).json({ message: "Failed to broadcast signal." });
  }
};

// Helper function for Email Broadcast
const broadcastSOSEmail = async (sosData, requesterName) => {
  try {
    // 1. Get all users except the one who created the SOS
    const users = await User.find({ _id: { $ne: sosData.userId } }).select("email");
    const emailList = users.map(u => u.email);

    if (emailList.length === 0) return;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ResQLink EMERGENCY" <${process.env.EMAIL_USER}>`,
      to: emailList, // Sends to everyone in the list
      subject: `⚠️ URGENT: ${sosData.type.toUpperCase()} Alert from ${requesterName}`,
      html: `
        <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #0f172a; padding: 40px 20px; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 2px solid #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);">
            
            <!-- Urgent Header -->
            <div style="background-color: #ef4444; padding: 25px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Emergency Broadcast</h1>
            </div>

            <div style="padding: 30px;">
              <p style="font-size: 18px; color: #f3f4f6; margin-bottom: 20px;">
                A new <strong>${sosData.type}</strong> emergency has been detected near your network.
              </p>

              <!-- Incident Details Card -->
              <div style="background-color: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border-left: 4px solid #ef4444; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Reported By</p>
                <p style="margin: 0 0 20px; font-size: 16px; font-weight: bold;">${requesterName}</p>

                <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Situation Summary</p>
                <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.5;">${sosData.description || 'No description provided.'}</p>

                <p style="margin: 0 0 10px; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Coordinates</p>
                <p style="margin: 0; font-family: monospace; color: #ef4444;">LAT: ${sosData.location.coordinates[1]} | LNG: ${sosData.location.coordinates[0]}</p>
              </div>

              <!-- Login CTA -->
              <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                   style="background-color: #ef4444; color: #ffffff; padding: 16px 35px; border-radius: 30px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
                   OPEN COMMAND CENTER
                </a>
                <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                  Please exercise caution while responding. If you are a trained volunteer, check the mission board.
                </p>
              </div>
            </div>

            <div style="background-color: #0f172a; padding: 15px; text-align: center;">
              <p style="color: #475569; font-size: 11px; margin: 0;">ResQLink Global Emergency Network &copy; 2025</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`SOS Alert Broadcasted to ${emailList.length} users.`);
  } catch (error) {
    console.error("Email Broadcast Error:", error);
  }
};

const getAllSOS = async (req, res) => {
  try {
    const alerts = await SOSRequest.find({ status: { $ne: 'resolved' } })
      .populate("userId", "fullName phone")
      .populate("assignedVolunteer", "fullName phone") 
      .populate("linkedResources")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
     res.status(500).json({ message: error.message });
   }
};
const getAllSOSAnalytics = async (req, res) => {
  try {
    // No filter = returns pending, accepted, resolved, cancelled
    const allAlerts = await SOSRequest.find({})
      .select('type status createdAt location') // Select only needed fields for speed
      .sort({ createdAt: -1 });

    res.json(allAlerts);
  } catch (error) {
    res.status(500).json({ message: "Analytics Error" });
  }
};
const getMyRequests = async (req, res) => {
  try {
    const requests = await SOSRequest.find({ userId: req.user._id })
      .populate('linkedResources') 
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching requests" });
  }
};
const updateSOSStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sos = await SOSRequest.findById(req.params.id);

    if (!sos) return res.status(404).json({ message: "SOS not found" });

    sos.status = status;

    if (status === 'accepted') {
      sos.assignedVolunteer = req.user._id; 
    }

    if (status === 'pending') {
      sos.assignedVolunteer = undefined;
    }

    await sos.save();
    
    const updatedSos = await SOSRequest.findById(sos._id)
      .populate("userId", "fullName phone")
      .populate("assignedVolunteer", "fullName phone");

    res.json(updatedSos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};
const getVolunteerHistory = async (req, res) => {
  try {
    const history = await SOSRequest.find({ assignedVolunteer: req.user._id })
      .populate("userId", "fullName phone")
      .sort({ updatedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
const assignTask = async (req, res) => {
  try {
    const { sosId, volunteerId } = req.body;
    console.log(`[ASSIGN] Attempting to assign task ${sosId} to ${volunteerId}`);

    // 1. Find SOS
    const sos = await SOSRequest.findById(sosId).populate("userId", "fullName");
    if (!sos) return res.status(404).json({ message: "Task not found" });

    // 2. Find Volunteer
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    console.log(`[ASSIGN] Found Volunteer: ${volunteer.email}`);

    // 3. Update SOS
    sos.assignedVolunteer = volunteerId;
    sos.status = "accepted"; 
    await sos.save();

    // 4. Trigger Email (Don't use 'await' here so the response returns faster)
    sendAssignmentEmail(volunteer, sos).catch(err => console.error("Email Helper Error:", err));

    res.json({ message: "Task Assigned Successfully", sos });
  } catch (error) {
    console.error("Assignment Controller Error:", error);
    res.status(500).json({ message: "Assignment Failed" });
  }
};

const sendAssignmentEmail = async (volunteer, sosData) => {
  // Debug check for credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("CRITICAL: Email credentials missing in .env file");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const missionID = sosData._id.toString().slice(-6).toUpperCase();

  const mailOptions = {
    from: `"ResQLink HQ" <${process.env.EMAIL_USER}>`,
    to: volunteer.email,
    subject: `🛡️ MISSION ASSIGNED: #${missionID}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; border: 1px solid #ddd; overflow: hidden;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h2 style="margin:0;">MISSION ASSIGNMENT</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hello <strong>${volunteer.fullName}</strong>,</p>
            <p>You have been assigned to the following emergency mission:</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p><strong>ID:</strong> #${missionID}</p>
              <p><strong>Type:</strong> ${sosData.type}</p>
              <p><strong>Victim:</strong> ${sosData.userId?.fullName || 'N/A'}</p>
              <p><strong>Status:</strong> IMMEDIATE RESPONSE REQUIRED</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                 style="background: #1e293b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 VIEW MISSION DETAILS
              </a>
            </div>
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("[EMAIL] Assignment email sent successfully:", info.messageId);
};
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('fullName email phone');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteers" });
  }
};
const acceptTask = async (req, res) => {
  try {
    const sos = await SOSRequest.findById(req.params.id);
    
    if (!sos) return res.status(404).json({ message: "Task not found" });
    if (sos.assignedVolunteer) return res.status(400).json({ message: "Task already taken" });

    sos.assignedVolunteer = req.user._id;
    sos.status = "accepted";
    await sos.save();

    res.json(sos);
  } catch (error) {
    res.status(500).json({ message: "Failed to accept task" });
  }
};
module.exports = { createSOS, getAllSOS ,getMyRequests,updateSOSStatus,getVolunteerHistory,assignTask,getVolunteers ,acceptTask,getAllSOSAnalytics};