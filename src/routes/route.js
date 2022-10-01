const express = require('express')
const userController = require('../controllers/userController')
const adminController = require("../controllers/admin controller")
const middleware = require('../middleware/auth')
const router = express.Router();


//=========================user Api=========================

router.post('/register',userController.registerUser)
router.post('/adminD',adminController.admin)
router.post("/login", adminController.login);
router.get('/getUser', middleware.auth ,adminController.getUsersDetails)



module.exports = router;
