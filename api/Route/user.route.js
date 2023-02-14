const router = require('express').Router();

const UserController = require('../controllers/user.controller');
const { checkForAuthentication, checkForSchoolAdminAuthorization } = require('../Authentication/verifyauth')

router.use(checkForAuthentication);
router.use(checkForSchoolAdminAuthorization);

router.get('/', UserController.userList);
router.get('/:id', UserController.findUser);

router.delete('/:id', UserController.userDelete);

router.put('/:id', UserController.userUpdate);
router.put('/approved/:id', UserController.updateStatus);

module.exports = router;