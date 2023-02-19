const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list');
const coursesController = require('../../controllers/coursesController');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(coursesController.getAllCourses)
    .post(coursesController.createNewCourse);

router.route('/:id')
    .get(coursesController.getCourse);

router.route('/:id/files')
    .get(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Student, ROLES_LIST.User), coursesController.getAllCourseFiles)
    .post(verifyRoles(ROLES_LIST.Teacher), coursesController.addCourseFiles);

module.exports = router;