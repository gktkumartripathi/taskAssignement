const express = require('express')
const userController = require('../controllers/userController')
const middleware = require('../middleware/auth')
const router = express.Router();


//=========================user Api=========================

router.post('/register',userController.registerUser)
router.post("/login", userController.login);
router.get('/getUser',userController.getUsersDetails)
router.put("/updatePassword/:userId",middleware.auth, userController.update)
router.delete('//users/:userId',middleware.auth,userController.deleteById)


module.exports = router;
