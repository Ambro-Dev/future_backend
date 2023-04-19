const express = require("express");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const User = require("../model/User");
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");
require("dotenv").config();

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/student-schema", async (req, res) => {
  try {
    const csvWriter = createCsvWriter({
      path: "student-schema.csv",
      header: [
        { id: "name", title: "Name" },
        { id: "surname", title: "Surname" },
        { id: "email", title: "Email" },
        { id: "password", title: "Password" },
        { id: "studentNumber", title: "Student Number" },
      ],
    });
    await csvWriter.writeRecords([]);
    res.download("student-schema.csv");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/teacher-schema", async (req, res) => {
  try {
    const csvWriter = createCsvWriter({
      path: "teacher-schema.csv",
      header: [
        { id: "name", title: "Name" },
        { id: "surname", title: "Surname" },
        { id: "email", title: "Email" },
        { id: "password", title: "Password" },
      ],
    });
    await csvWriter.writeRecords([]);
    res.download("teacher-schema.csv");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/import-students", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        const { name, surname, email, password, studentNumber } = row;
        const newUser = new User({
          name,
          surname,
          email,
          password,
          studentNumber,
        });
        newUser.save();
      })
      .on("end", () => {
        fs.unlinkSync(file.path);
        res.status(200).json({ message: "User upload completed" });
      });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
