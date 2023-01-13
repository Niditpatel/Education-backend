const router = require('express').Router();

const AuthController = require('../controllers/auth.controller');

router.get('/userexists', AuthController.userByEmail);

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/verify', AuthController.verifyAccount);
router.post('/active', AuthController.activeAccount);
router.post('/forgotpassword', AuthController.forgotPassword);
router.post('/resetpassword', AuthController.resetPassword);
// router.post('/mail', AuthController.sendmail);


module.exports = router;