const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list');
const adminController = require('../../controllers/adminController');
const usersController = require('../../controllers/usersController');
const multer = require("multer");

const verifyRoles = require('../../middleware/verifyRoles');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/imports");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const uploads = multer({ storage: storage });

router.route('/import-teachers')
    .post(verifyRoles(ROLES_LIST.Admin), uploads.single("file"), adminController.importTeachers);

router.route('/import-students')
    .post(verifyRoles(ROLES_LIST.Admin), uploads.single("file"), adminController.importStudents);

router.route('/teacher-schema')
    .get(verifyRoles(ROLES_LIST.Admin), adminController.getTeacherCsv);

router.route('/student-schema')
    .get(verifyRoles(ROLES_LIST.Admin), adminController.getStudentCsv);

router.route('/users')
    .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsersforAdmin);

module.exports = router;
