const crypto = require("crypto");
const { GridFsStorage } = require("multer-gridfs-storage");
const methodOverride = require("method-override");
const multer = require("multer");
const { gfs } = require("../server");
require("dotenv").config();
const path = require("path");

const storage = new GridFsStorage({
    url: "mongodb+srv://future:future@cluster0.tpjqxfb.mongodb.net/?retryWrites=true&w=majority/futureDB",
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
  
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "course_files",
          };
          resolve(fileInfo);
        });
      });
    },
  });
  
  const upload = multer({
    storage,
  });
  
const getFiles = (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render("index", { files: false });
      } else {
        files.map((file) => {
          if (
            file.contentType === "image/jpeg" ||
            file.contentType === "image/png"
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render("index", { files: files });
      }
    });
  };
  
  const uploadFile = (req, res) => {
    res.status(200).json({ message: "Files uploaded successfully" });
  };
  
const getFile = (req, res) => {
    const path = req.params.path || "/";
    const courseId = req.query.courseId;
  
    gfs
      .find({
        "metadata.courseId": courseId,
        "metadata.path": { $regex: `^${path}` },
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({ err: "No files found" });
        }
  
        return res.json({ files });
      });
  };
  
const createFolder = (req, res) => {
    const path = req.body.path || "/";
    const courseId = req.body.courseId;
    const folderName = req.body.folderName;
  
    gfs
      .find({
        "metadata.courseId": courseId,
        "metadata.path": path,
        "metadata.filename": folderName,
      })
      .toArray((err, files) => {
        if (err) {
          return res.status(500).json({ err: err.message });
        }
  
        if (files.length > 0) {
          return res.status(400).json({ err: "Folder already exists" });
        }
  
        const fileInfo = {
          filename: folderName,
          bucketName: "course_files",
          metadata: {
            path: path,
            courseId: courseId,
            isFolder: true,
          },
        };
  
        gfs.upload(Buffer.alloc(0), fileInfo, (err, file) => {
          if (err) {
            return res.status(500).json({ err: err.message });
          }
  
          return res.json({ message: "Folder created successfully" });
        });
      });
  };

  module.exports = {upload, uploadFile};