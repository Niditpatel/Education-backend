const router = require('express').Router();

const ClassController = require('../controllers/class.controller');
const { checkForAuthentication, checkForSchoolTeacherAuthorization } = require('../Authentication/verifyauth');


router.use(checkForAuthentication);
router.use(checkForSchoolTeacherAuthorization);

router.post('/', ClassController.classCreate);


module.exports = router;