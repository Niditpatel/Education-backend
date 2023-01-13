const router = require('express').Router();

const BookController = require('../controllers/book_controller');
const { checkForAuthentication, checkForSchoolAdminAuthorization, checkForAdminAuthorization } = require('../Authentication/verifyauth')


router.get('/list', BookController.bookList);

router.post('/create', checkForAuthentication, checkForAdminAuthorization, BookController.bookCreate);

router.put('/update', checkForAuthentication, checkForAdminAuthorization, BookController.bookUpdate);

router.delete('/delete', checkForAuthentication, checkForAdminAuthorization, BookController.bookDelete)


module.exports = router;