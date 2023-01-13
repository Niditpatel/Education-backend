const router = require('express').Router();

const UserController = require('../controllers/user.controller');
const { checkForAuthentication, checkForSchoolAdminAuthorization } = require('../Authentication/verifyauth')

router.use(checkForAuthentication);
router.use(checkForSchoolAdminAuthorization);

router.get('/getall', UserController.users);
router.get('/list', UserController.userList);


router.delete('/delete/:id', UserController.userDelete);

router.put('/update/:id', UserController.userUpdate);


module.exports = router;