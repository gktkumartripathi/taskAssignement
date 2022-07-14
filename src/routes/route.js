const express = require('express')
const userController = require('../controllers/userController')
const middleware = require('../middleware/auth')
const router = express.Router();


//=========================user Api=========================

router.post('/register',userController.createUser)
router.post("/login", userController.login);
router.put("/updatePassword/:userId",middleware.auth, userController.update)


module.exports = router;
