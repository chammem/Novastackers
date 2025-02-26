const RoleVerification = require("../models/roleVerification");
const upload = require("../middleware/upload");


exports.uploadDriverDocuments =  async (req, res) => {
      // Function logic here
      try {
         const {driverId,vehiculeType} = req.body;

         const driverLicenseUrl = vehiculeType === "motor" ? null : req.files.driverLicense[0].path;
         const vehiculeRegistrationUrl = req.files.vehiculeRegistration[0].path;
        //console.log("received files",req.files);
         const verification = await RoleVerification.findOneAndUpdate({userId:driverId},
             {driverLicense:{url:driverLicenseUrl,verified:false},
             vehiculeRegistration:{url:vehiculeRegistrationUrl,verified:false},
             status:"pending",
             },
             {upsert:true,new:true}
         );
        res.status(200).json({
            message:"Documents uploaded successfully",
            verification,
        });
    } 
      catch (error) {
        console.log("Error uploading documents:",error);
        res.status(500).json({message:"An error occured while uploading documents"});
      }
    }

exports.uploadRestaurantSuperMarketDocuments = async (req, res) => {
    try {
        const {buisnessId} = req.body;
        const businessLicenseNumberUrl = req.files.businessLicenseNumber[0].path;
        const taxIdUrl = req.files.taxId[0].path;
        console.log('Business ID:', buisnessId);
        const verification = await RoleVerification.findOneAndUpdate({userId:buisnessId},
            {businessLicenseNumber:{url:businessLicenseNumberUrl,verified:false},
            taxId:{url:taxIdUrl,verified:false},
            status:"pending",
            },
            {upsert:true,new:true}   
        )
        res.status(200).json({
            message: "Business documents uploaded successfully",verification
        });

    } catch (error) {
        console.log("Error uploading business documents:", error);
        res.status(500).json({ message: "An error occurred while uploading documents" });
    }}

exports.getAllDriverVerifications = async (req,res) => {
    try {
        const verifications = await RoleVerification.find({ status: "pending" })
          .populate("userId", "email role fullName") // Populate user details
          .exec();
        res.status(200).json(verifications);
      } catch (error) {
        console.error("Error fetching pending verifications:", error);
        res.status(500).json({ message: "An error occurred while fetching verifications" });
      }


}



