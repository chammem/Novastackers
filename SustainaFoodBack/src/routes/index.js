const express = require('express')
const userValidatorSchema = require("../middleware/userValidator");   
const validateRequest = require("../middleware/validateRequest");
const router = express.Router()
const foodController = require("../controllers/food/foodItem")
const roleVerification = require("../controllers/roleVerification")



const  {registerVerification, userSendVerificationMail} = require('../controllers/auth/userSignUp')
const userSignInController = require('../controllers/auth/userSignIn')
const authToken = require('../middleware/authToken')
const userDetailsController = require('../controllers/auth/userDetails')
const userLogout = require('../controllers/auth/userLogout')
const allUsers = require('../controllers/allUsers');
const { addFoodItem } = require('../controllers/food/foodItem');
const { uploadDriverDocuments } = require('../controllers/roleVerification');
const upload = require("../middleware/upload");


router.get("/auth-endpoint",authToken,(request, response) => {
  response.json({ message: "You are authorized to access me" });
});

router.post("/sign-up",validateRequest(userValidatorSchema), userSendVerificationMail);
router.post("/verification",registerVerification);
router.post("/login",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.post("/userLogout",userLogout)
router.get("/verification",registerVerification);

//admin panel
router.get("/users",allUsers.allUsers)
router.get('/user/:id', allUsers.getUser);
router.put('/updateUser/:id', allUsers.updateUser);
router.delete('/deleteUser/:id', allUsers.deleteUser);
router.put('/disableUser/:id', allUsers.disableUser);


// DOCUMENT UPLOADING //
router.post("/upload-driver-documents", upload.fields([
    { name: "driverLicense", maxCount: 1 },
    { name: "vehiculeRegistration", maxCount: 1 },
  ]),roleVerification.uploadDriverDocuments);
router.post("/upload-buisness-documents",upload.fields([
    { name: "taxId", maxCount: 1 },
    { name: "businessLicenseNumber", maxCount: 1 },
  ]),roleVerification.uploadRestaurantSuperMarketDocuments);

  //role verification//

  router.get("/pending-verification",roleVerification.getAllDriverVerifications)


//Food Related Routes//

router.post("/add-food",foodController.addFoodItem);
router.delete("/delete-food/:foodId",foodController.deleteFoodItem);

module.exports = router