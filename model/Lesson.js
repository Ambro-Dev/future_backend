const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  name: {type: String},
  courseId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  start: {
    type: Date,
  },
  end: {
    type: Date,
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
