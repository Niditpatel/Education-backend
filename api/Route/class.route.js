const router = require('express').Router();

const ClassController = require('../controllers/class.controller');
const { checkForAuthentication, checkForSchoolTeacherAuthorization } = require('../Authentication/verifyauth');


router.use(checkForAuthentication);
router.use(checkForSchoolTeacherAuthorization);

router.get('/board', ClassController.examBoard);
router.get('/stage', ClassController.keyStages);
router.get('/', ClassController.classList);

router.post('/', ClassController.classCreate);


module.exports = router;