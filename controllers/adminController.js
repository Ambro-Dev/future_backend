const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const User = require("../model/User");
const csvtojson = require("csvtojson");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { handleNewUser } = require("./registerController");
const { createCourseAdmin } = require("./coursesController");
const Course = require("../model/Course");
require("dotenv").config();

const getStudentCsv = async (req, res) => {
  try {
    const csvWriter = createCsvWriter({
      path: "student-schema.csv",
      header: [
        { id: "name", title: "name" },
        { id: "surname", title: "surname" },
        { id: "email", title: "email" },
        { id: "password", title: "password" },
        { id: "studentNumber", title: "studentNumber" },
      ],
    });
    await csvWriter.writeRecords([]);
    res.download("student-schema.csv");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCourseCsv = async (req, res) => {
  try {
    const csvWriter = createCsvWriter({
      path: "course-schema.csv",
      header: [
        { id: "name", title: "name" },
        { id: "teacherEmail", title: "teacherEmail" },
      ],
    });
    await csvWriter.writeRecords([]);
    res.download("course-schema.csv");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getTeacherCsv = async (req, res) => {
  try {
    const csvWriter = createCsvWriter({
      path: "teacher-schema.csv",
      header: [
        { id: "name", title: "name" },
        { id: "surname", title: "surname" },
        { id: "email", title: "email" },
        { id: "password", title: "password" },
      ],
    });
    await csvWriter.writeRecords([]);
    res.download("teacher-schema.csv");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getImportMembersCsv = async (req, res) => {
  try {
    const csvWriter = createCsvWriter({
      path: "import-members.csv",
      header: [{ id: "studentNumber", title: "studentNumber" }],
    });
    await csvWriter.writeRecords([]);
    res.download("import-members.csv");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCourses = async (req, res) => {
  const userId = req.params.id;

  // Find all the groups that the student is in
  const user = await User.findById(userId);

  const courses = await Course.find({
    members: { $nin: user._id },
  })
    .populate("teacherId", "_id name surname")
    .populate({
      path: "members",
      select: "_id name surname studentNumber",
    })
    .select("_id name teacherId");
  if (!courses) return res.status(204).json({ message: "No courses found." });
  res.json(courses);
};

const importStudents = async (req, res) => {
  try {
    const file = req.file;
    const jsonArray = await csvtojson().fromFile(req.file.path);
    const results = [];
    const errors = [];
    for (let i = 0; i < jsonArray.length; i++) {
      try {
        const { name, surname, email, password, studentNumber } = jsonArray[i];
        const roles = { Student: 1984 };
        const { status, message } = await handleNewUser({
          body: { name, surname, email, password, studentNumber, roles },
        });
        console.log(message);
        if (status && status === 201) {
          results.push(jsonArray[i]);
        } else {
          errors.push({ line: i + 1, error: message });
        }
      } catch (err) {
        console.log(err);
        errors.push({ line: i + 1, error: err.message });
      }
    }
    res.json({ results, errors });
    const filePath = path.join(".", "public", "imports", file.filename);
    fs.unlinkSync(filePath);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addCourseMembers = async (req, res) => {
  try {
    const courseId = req.body.id;
    const userId = req.body.user;

    const course = await Course.findById(courseId);

    if (course.members.includes(userId)) {
      return { status: 409, message: "User is already a member of the course" };
    }

    // Add the specified member to the course's members array
    course.members.push(userId);

    await course.save();

    return { status: 201, message: "Member added to the course" };
  } catch (err) {
    console.error(err);
    return { status: 500, message: "Server error" };
  }
};

const importMembers = async (req, res) => {
  try {
    const course = req.params.id;
    if (!course) {
      return { status: 409, message: "No course ID" };
    }
    const file = req.file;
    const jsonArray = await csvtojson().fromFile(req.file.path);
    const results = [];
    const errors = [];
    for (let i = 0; i < jsonArray.length; i++) {
      try {
        const { studentNumber } = jsonArray[i];
        const user = await User.findOne({
          studentNumber: studentNumber,
        }).exec();
        const { status, message } = await addCourseMembers({
          body: { id: course, user: user._id },
        });
        console.log(message);
        if (status && status === 201) {
          results.push(jsonArray[i]);
        } else {
          errors.push({ line: i + 1, error: message });
        }
      } catch (err) {
        console.log(err);
        errors.push({ line: i + 1, error: err.message });
      }
    }
    res.json({ results, errors });
    const filePath = path.join(".", "public", "imports", file.filename);
    fs.unlinkSync(filePath);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const importCourses = async (req, res) => {
  try {
    const file = req.file;
    const jsonArray = await csvtojson().fromFile(req.file.path);
    const results = [];
    const errors = [];
    for (let i = 0; i < jsonArray.length; i++) {
      try {
        const { name, teacherEmail } = jsonArray[i];
        console.log(name, teacherEmail);
        const teacher = await User.findOne({ email: teacherEmail }).exec();
        console.log(teacher);
        const { status, message } = await createCourseAdmin({
          body: { name, teacherId: teacher._id },
        });
        console.log(message);
        if (status && status === 201) {
          results.push(jsonArray[i]);
        } else {
          errors.push({ line: i + 1, error: message });
        }
      } catch (err) {
        console.log(err);
        errors.push({ line: i + 1, error: err.message });
      }
    }
    res.json({ results, errors });
    const filePath = path.join(".", "public", "imports", file.filename);
    fs.unlinkSync(filePath);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const importTeachers = async (req, res) => {
  try {
    const file = req.file;
    const jsonArray = await csvtojson().fromFile(req.file.path);
    const results = [];
    const errors = [];
    for (let i = 0; i < jsonArray.length; i++) {
      try {
        const { name, surname, email, password } = jsonArray[i];
        const roles = { Teacher: 5150 };
        const { status, message } = await handleNewUser({
          body: { name, surname, email, password, roles },
        });
        console.log(message);
        if (status && status === 201) {
          results.push(jsonArray[i]);
        } else {
          errors.push({ line: i + 1, error: message });
        }
      } catch (err) {
        console.log(err);
        errors.push({ line: i + 1, error: err.message });
      }
    }
    res.json({ results, errors });
    const filePath = path.join(".", "public", "imports", file.filename);
    fs.unlinkSync(filePath);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const passwordChange = async (req, res) => {
  const { id, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(newPassword, user.password);
    if (passwordMatch) {
      return res.status(401).json({ message: "Current password is the same" });
    }
    // Encrypt the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  importTeachers,
  importStudents,
  getTeacherCsv,
  getStudentCsv,
  getCourseCsv,
  importCourses,
  getCourses,
  getImportMembersCsv,
  importMembers,
  passwordChange,
};
