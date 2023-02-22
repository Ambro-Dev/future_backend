const Conversation = require('../model/Conversation');
const Message = require('../model/Message');

// Create a new conversation
const createConversation =  async (req, res) => {
  try {
    const { name, members } = req.body;

    const conversation = await Conversation.create({ name, members });
    await conversation.save();

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get conversations for a user
const getUserConversation =  async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({ $or: [{ user1: userId }, { user2: userId }] }).populate('user1 user2');

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllConversations =  async (req, res) => {
  try {

    const conversations = await Conversation.find();

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send a message
const sendMessage =  async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body;

    const message = new Message({ conversation: conversationId, sender, text });
    await message.save();

    // Emit the message to the recipients using Socket.io
    const io = req.app.get('io');
    const conversation = await Conversation.findById(conversationId).populate('user1 user2');
    const recipients = [conversation.user1._id, conversation.user2._id].filter(id => id.toString() !== sender);
    recipients.forEach(recipient => {
      io.to(recipient.toString()).emit('message', { conversation: conversationId, sender, text });
    });

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMessages = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Conversation ID required." });

  const messages = await Message.findOne({ conversation: req.params.id }).exec();
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
    sendMessage,
    getAllConversations,
    getMessages
  };
