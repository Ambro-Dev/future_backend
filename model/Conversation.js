const mongoose = require('mongoose');
const Message = require('./Message');

const conversationSchema = new mongoose.Schema({
  name: {type: String},
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [Message],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
