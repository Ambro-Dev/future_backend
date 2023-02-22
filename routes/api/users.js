const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const coursesController = require('../../controllers/coursesController');

router.route('/')
    .get(usersController.getAllUsers)
    .delete(verifyRoles(ROLES_LIST.User), usersController.deleteUser);

router.route('/:id')
    .get(usersController.getUser);

router.route('/:id/profile-picture')
    .post(verifyRoles(ROLES_LIST.User), usersController.uploadProfilePicture);

router.route('/:id/groups')
    .get(verifyRoles(ROLES_LIST.User), usersController.getUserGroups);

router.route('/:id/courses')
    .get(verifyRoles(ROLES_LIST.Teacher, ROLES_LIST.Student), coursesController.getAllUserCourses)

module.exports = router;