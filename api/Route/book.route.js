const router = require('express').Router();

const BookController = require('../controllers/book.controller');
const { checkForAuthentication, checkForSchoolAdminAuthorization, checkForAdminAuthorization } = require('../Authentication/verifyauth')


router.get('/', BookController.bookList);

router.post('/', checkForAuthentication, checkForAdminAuthorization, BookController.bookCreate);

router.put('/', checkForAuthentication, checkForAdminAuthorization, BookController.bookUpdate);

router.delete('/', checkForAuthentication, checkForAdminAuthorization, BookController.bookDelete)


module.exports = router;