const router = require('express').Router();

const AuthController = require('../controllers/auth.controller');

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/verify', AuthController.verifyAccount);
router.put('/active', AuthController.activeAccount);
router.post('/forgotpassword', AuthController.forgotPassword);
router.post('/resetpassword', AuthController.resetPassword);
router.post('/checkfortoken', AuthController.checkForResetPassword);
router.put('/regeneratetoken', AuthController.generateActiveLink);


module.exports = router;