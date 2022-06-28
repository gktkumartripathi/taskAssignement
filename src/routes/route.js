const express = require('express')
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')

const middleware = require('../middleware/auth')
const router = express.Router();


//=========================user Api=========================

router.post('/register',userController.createUser)
router.post("/login", userController.login);
router.put("/updatePassword/:userId",middleware.auth, userController.update)

//   ==============Book Api================================

router.post("/books", middleware.auth, bookController.createBook)
router.get("/books",  bookController.getBooks )
router.get("/books/:bookId", bookController.getBooksById)


module.exports = router;
