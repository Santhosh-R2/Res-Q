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

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    console.error("Contact Error:", error);
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

module.exports = { submitContactForm, getAllMessages };