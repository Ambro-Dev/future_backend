const express = require('express');
const router = express.Router();
const ROLES_LIST = require('../../config/roles_list');
const eventsController = require('../../controllers/eventsController');

const verifyRoles = require('../../middleware/verifyRoles');

router.route('/create')
    .post(verifyRoles(ROLES_LIST.User), eventsController.createEvent);

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.User), eventsController.getCourseEvents);

router.route('/:id/update')
    .put(verifyRoles(ROLES_LIST.User), eventsController.setEventUrl);

module.exports = router;
