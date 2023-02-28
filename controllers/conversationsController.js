const Conversation = require("../model/Conversation");
const Message = require("../model/Message");
const User = require("../model/User");

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { name, members } = req.body;

    const conversation = await Conversation.create({ name, members });
    await conversation.save();

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get conversations for a user
const getUserConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({ members: req.params.id });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find();

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message
const createMessage = async (req, res) => {
  try {
    const { conversation, sender, text } = req.body;
    const message = new Message({ conversation, sender, text }); // include the sender as a recipient
    await message.save();
    console.log(conversation);
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getMessages = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Conversation ID required." });

  const messages = await Message.find({ conversation: req.params.id }).exec();
  if (!messages) {
    return res
      .status(204)
      .json({ message: `No conversation matches ID ${req.params.id}.` });
  }
  res.json(messages);
};

module.exports = {
  getUserConversation,
  createConversation,
  createMessage,
  getAllConversations,
  getMessages,
};
