const Course = require("../model/Course");
const User = require("../model/User");
const fs = require("fs");
const path = require("path");

const getAllCourses = async (req, res) => {
  const courses = await Course.find();
  if (!courses) return res.status(204).json({ message: "No courses found." });
  res.json(courses);
};

const createNewCourse = async (req, res) => {
  if (!req?.body?.name || !req?.body?.teacherId) {
    return res
      .status(400)
      .json({ message: "Name of the course and teacher are required" });
  }
  const teacher = await User.findById(req.body.teacherId);
  if (!teacher) {
    res
      .status(400)
      .json({
        message: "No such teacher or provided id does not belong to teacher",
      });
  }

  try {
    const { name, teacherId, groupIds } = req.body;
    // Create the course in the database
    const course = await Course.create({ name, teacherId, groupIds });

    // Create a folder for the course using the course ID as the folder name
    const folderName = course._id.toString();
    fs.mkdirSync(`./public/storage/courses/${folderName}`);

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCourse = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Course ID required." });

  const course = await Course.findOne({ _id: req.params.id }).exec();
  if (!course) {
    return res
      .status(204)
      .json({ message: `No course matches ID ${req.params.id}.` });
  }
  res.json(course);
};

const getCourseTeacher = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "Course ID required." });

  const course = await Course.findById(req.params.id);
  const teacher = await User.findById(course.teacherId);
  const teacherInfo = {
    _id: teacher.id,
    name: teacher.name,
    surname: teacher.surname,
    picture: teacher.picture,
  };
  if (!course) {
    return res
      .status(204)
      .json({ message: `No course matches ID ${req.params.id}.` });
  }
  res.json(teacherInfo);
};

function getFilesInFolder(folderPath) {
  const files = [];

  // Get a list of all files and subfolders in the folder
  const folderContents = fs.readdirSync(folderPath);

  for (const content of folderContents) {
    // Get the full path of the file or subfolder
    const contentPath = path.join(folderPath, content);

    // If the content is a file, add its path to the list of files
    if (fs.statSync(contentPath).isFile()) {
      files.push(contentPath);
    }

    // If the content is a subfolder, recursively call this function to get its files
    if (fs.statSync(contentPath).isDirectory()) {
      files.push(...getFilesInFolder(contentPath));
    }
  }

  return files;
}

const getAllCourseFiles = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the course in the database
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Get a list of all files in the course folder
    const folderName = course._id.toString();
    const files = getFilesInFolder(`./public/storage/courses/${folderName}`);

    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addCourseFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, fileContent } = req.body;

    // Find the course in the database
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Get the path of the course folder
    const folderName = course._id.toString();
    const folderPath = `./public/storage/${folderName}`;

    // Create the course folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    // Create the new file in the course folder
    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, fileContent);

    res.json({ message: "File created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUserCourses = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find all the groups that the student is in
    const user = await User.findById(userId);

    // Get all courses associated with those groups
    const courses = await Course.find({
      members: { $in: user._id },
    })
      .populate("teacherId", "_id name surname picture")
      .populate({
        path: "members",
        select: "_id name surname studentNumber picture",
      })
      .select("_id name teacherId");

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllCourseMembers = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId).populate(
      "members",
      "_id name surname studentNumber picture"
    );
    const members = course.members.map((member) => ({
      _id: member._id,
      name: member.name,
      surname: member.surname,
      studentNumber: member.studentNumber,
      picture: member.picture,
    }));
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCourses,
  createNewCourse,
  getCourse,
  getAllCourseFiles,
  getAllUserCourses,
  addCourseFiles,
  getAllCourseMembers,
  getCourseTeacher,
};
