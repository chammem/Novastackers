const express = require('express')

const router = express.Router()

const userSignUpController = require('../controllers/auth/userSignUp')
const userSignInController = require('../controllers/auth/userSignIn')
const authToken = require('../middleware/authToken')
const userDetailsController = require('../controllers/auth/userDetails')
const userLogout = require('../controllers/auth/userLogout')
const allUsers = require('../controllers/allUsers')



router.post("/sign-up", userSignUpController)
router.post("/login",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)

//admin panel
router.get("/users",allUsers.allUsers)
router.get('/user/:id', allUsers.getUser);
router.put('/updateUser/:id', allUsers.updateUser);
router.delete('/deleteUser/:id', allUsers.deleteUser);

module.exports = router