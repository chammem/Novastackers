const express = require('express')

const router = express.Router()

const userSignUpController = require('../controllers/userSignUp')
const userSignInController = require('../controllers/userSignIn')
const authToken = require('../middleware/authToken')
const userDetailsController = require('../controllers/userDetails')
const userLogout = require('../controllers/userLogout')
const allUsers = require('../controllers/allUsers')



router.post("/sign-up", userSignUpController)
router.post("/login",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)

//admin panel
router.get("/all-user",authToken,allUsers)


module.exports = router