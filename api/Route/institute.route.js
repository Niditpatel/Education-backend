const router = require('express').Router();

const InstituteController = require('../controllers/institute.controller');
const { checkForAuthentication, checkForAdminAuthorization } = require('../Authentication/verifyauth');


router.use(checkForAuthentication);
router.use(checkForAdminAuthorization);

router.get('/', InstituteController.instituteList);
router.get('/type', InstituteController.getTypes);
router.get('/territory', InstituteController.getTerritory);
router.get('/level', InstituteController.getLevel);
router.get('/:id', InstituteController.instituteById);

router.delete('/:id', InstituteController.instituteDelete);

router.put('/:id', InstituteController.instituteUpdate);

router.post('/', InstituteController.instituteCreate);


module.exports = router;