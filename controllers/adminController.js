const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const User = require("../model/User");
const csvtojson = require("csvtojson");
const path = require("path");
const fs = require("fs");
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

const importStudents =  async (req, res) => {
  try {
    const file = req.file;
    const jsonArray = await csvtojson().fromFile(req.file.path);
    const results = [];
    const errors = [];
    for (let i = 0; i < jsonArray.length; i++) {
      try {
        const { name, surname, email, password, studentNumber } = jsonArray[i];
        const newUser = new User({
          name,
          surname,
          email,
          password,
          studentNumber,
          roles: {"Student": 1984},
        });
        await newUser.save();
        console.log(`User ${name} ${surname} saved to database`);
        results.push(jsonArray[i]);
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
        const newUser = new User({
          name,
          surname,
          email,
          password,
          roles: {"Teacher": 5150},
        });
        await newUser.save();
        console.log(`User ${name} ${surname} saved to database`);
        results.push(jsonArray[i]);
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

module.exports = { importTeachers, importStudents, getTeacherCsv, getStudentCsv };
