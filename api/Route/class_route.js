const router = require('express').Router();

const ClassController = require('../controllers/class_controller');
const { checkForAuthentication, checkForSchoolTeacherAuthorization } = require('../Authentication/verifyauth');


router.use(checkForAuthentication);
router.use(checkForSchoolTeacherAuthorization);

router.post('/create', ClassController.classCreate);


module.exports = router;