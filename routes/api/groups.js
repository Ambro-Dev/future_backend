const express = require('express');
const router = express.Router();
const groupsController = require('../../controllers/groupsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .get(groupsController.getAllGroups)
    .post(verifyRoles(ROLES_LIST.Admin), groupsController.createNewGroup);

router.route('/:id')
    .get(groupsController.getGroup);

module.exports = router;