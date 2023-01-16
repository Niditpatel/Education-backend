const router = require('express').Router();

const InstituteController = require('../controllers/institute.controller');
const { checkForAuthentication, checkForAdminAuthorization } = require('../Authentication/verifyauth');


router.use(checkForAuthentication);
router.use(checkForAdminAuthorization);

router.get('/getAll', InstituteController.institutes);
router.get('/list', InstituteController.instituteList);

router.delete('/delete/:id', InstituteController.instituteDelete);

router.put('/update/:id', InstituteController.instituteUpdate);

router.post('/create', InstituteController.instituteCreate);






module.exports = router;