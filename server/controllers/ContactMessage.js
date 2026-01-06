const ContactMessage = require("../models/ContactMessage");

const submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const newMessage = await ContactMessage.create({
      firstName,
      lastName,
      email,
      subject,
      message,
    });

    res.status(201).json({ success: true, message: "Message sent!", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Server Error sending message." });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    res.json(message);
  } catch (error) {
    console.error("Fetch Message Error:", error);
    res.status(500).json({ message: "Invalid ID or Server Error" });
  }
};

const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "read", "replied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: `Status updated to ${status}`, data: updatedMessage });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server Error updating status" });
  }
};

module.exports = { 
  submitContactForm, 
  getAllMessages, 
  getMessageById, 
  updateMessageStatus 
};