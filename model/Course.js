const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Event = require('./Event');


const courseSchema = new Schema({
  name: {
    type: "string",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  pic: {
    type: "string",
  },
  events: [Event]
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;


