const Course = require("../model/Course");

const createEvent = async (req, res) => {
  try {
    const courseId = await Course.findById(req.body.course);
    const event = {
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      start: req.body.start,
      end: req.body.end,
      className: req.body.className
    };
    courseId.events.push(event);

    const savedCourse = await courseId.save();
    const savedEvent = savedCourse.events[savedCourse.events.length - 1]; // Get the last event in the array, which should be the one just added

    res.json(savedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while saving the event" });
  }
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

const getUserEvents = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  
  const courses = await Course.find({ members: req.params.id }).exec();
  
  if (!courses.length) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} is not a member of any courses` });
  }
  
  const events = courses
    .map(course => course.events)
    .flat()
    .map(event => {
      const { _id, title, start, end, url } = event;
      return { _id, title, start, end, url };
    });
  
  res.json(events);
};


const setEventUrl = async (req, res) => {
  console.log(req.body);
  try {
    const course = req.params.id;
    const { event, url } = req.body;
    Course.findOneAndUpdate(
      { _id: course, "events._id": event },
      { $set: { "events.$.url": url } },
      { new: true },
      (err) => {
        if (err) {
          console.log("Error updating event:", err);
        }
      }
    );
    res.json({message: "Updated"});
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the event" });
  }
};

module.exports = { createEvent, getCourseEvents, setEventUrl, getUserEvents };
