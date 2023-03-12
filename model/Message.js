const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for chat messages
const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  text: {type: String},
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);
