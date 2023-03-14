const Course = require("../model/Course");

const createEvent = async (req, res) => {
  const courseId = await Course.findById(req.body.course);
  const event = {
    name: req.body.name,
    description: req.body.description,
    url: req.body.url,
    start: req.body.start,
    end: req.body.end,
  };
  courseId.events.push(event);

  await courseId.save();

  res.json(courseId.events);
};

const getCourseEvents = async (req, res) => {
    if (!req?.params?.id)
      return res.status(400).json({ message: "Course ID required" });
    const course = await Course.findOne({ _id: req.params.id }).exec();
    if (!course) {
      return res
        .status(204)
        .json({ message: `Course ID ${req.params.id} not found` });
    }
    res.json(course.events);
  };

module.exports = { createEvent, getCourseEvents };
