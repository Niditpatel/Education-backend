const router = require('express').Router();

const InstituteController = require('../controllers/institute.controller');
const { checkForAuthentication, checkForAdminAuthorization } = require('../Authentication/verifyauth');


router.use(checkForAuthentication);
router.use(checkForAdminAuthorization);

router.get('/', InstituteController.instituteList);

router.delete('/:id', InstituteController.instituteDelete);

router.put('/:id', InstituteController.instituteUpdate);

router.post('/', InstituteController.instituteCreate);


module.exports = router;