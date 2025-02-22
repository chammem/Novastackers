const express = require('express')
const userValidatorSchema = require("../middleware/userValidator");   
const validateRequest = require("../middleware/validateRequest");
const router = express.Router()



const  {registerVerification, userSendVerificationMail} = require('../controllers/auth/userSignUp')
const userSignInController = require('../controllers/auth/userSignIn')
const authToken = require('../middleware/authToken')
const userDetailsController = require('../controllers/auth/userDetails')
const userLogout = require('../controllers/auth/userLogout')
const allUsers = require('../controllers/allUsers')



router.post("/sign-up",validateRequest(userValidatorSchema), userSendVerificationMail);
router.post("/verification",registerVerification);
router.post("/login",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)
router.get("/verification",registerVerification);
//admin panel
router.get("/all-user",authToken,allUsers)


module.exports = router