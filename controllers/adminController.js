const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const User = require("../model/User");
const csvtojson = require("csvtojson");
const path = require("path");
const fs = require("fs");
const { handleNewUser } = require("./registerController");
const { createCourseAdmin } = require("./coursesController");
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

module.exports = {
  importTeachers,
  importStudents,
  getTeacherCsv,
  getStudentCsv,
  getCourseCsv,
  importCourses,
};
