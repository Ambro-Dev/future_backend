const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list');
const conversationsController = require('../../controllers/conversationsController');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/')
    .post(conversationsController.sendMessage);

router.route('/:id')
    .get(conversationsController.getMessages);

module.exports = router;
