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


router.post("/sign-up",validateRequest(userValidatorSchema), userSendVerificationMail);
router.post("/verification",registerVerification);
router.post("/login",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)
router.get("/verification",registerVerification);
//admin panel
router.get("/all-user",authToken,allUsers)

// DOCUMENT UPLOADING //
router.post("/upload-driver-documents", upload.fields([
    { name: "driverLicense", maxCount: 1 },
    { name: "vehiculeRegistration", maxCount: 1 },
  ]),roleVerification.uploadDriverDocuments);
router.post("/upload-buisness-documents",upload.fields([
    { name: "taxId", maxCount: 1 },
    { name: "businessLicenseNumber", maxCount: 1 },
  ]),roleVerification.uploadRestaurantSuperMarketDocuments);


//Food Related Routes//

router.post("/add-food",foodController.addFoodItem);
router.delete("/delete-food/:foodId",foodController.deleteFoodItem);

module.exports = router