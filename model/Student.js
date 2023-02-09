const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: {
        type: "string",
        required: true,
    },
    surname: {
        type: "string",
    },
    studentNumber: {
        type: "string",
        required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    }
});

module.exports = mongoose.model('Student', studentSchema);