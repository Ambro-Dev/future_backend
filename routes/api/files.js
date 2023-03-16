const express = require('express');
const { upload, uploadFile } = require('../../controllers/filesController');
const router = express.Router();

router.route("/upload")
    .post(upload.single("file"), uploadFile)

module.exports = router;

