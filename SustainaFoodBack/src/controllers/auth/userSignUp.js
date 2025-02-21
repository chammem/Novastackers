const userModel = require("../../models/userModel");
const nodemailer= require('nodemailer');
const bcrypt = require('bcryptjs');
require("dotenv").config();
const Verification = require("../../models/Verification")
const sendMail = require("../../config/mailer");
async function createVerification(email,code){
    try {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Set expiration 15 min from now

        const newVerification = new Verification({ email, code, expiresAt });
        const savedUserVerification = await newVerification.save();
        
        console.log("Verification created:", savedUserVerification);
    } catch (error) {
        console.error("Error creating verification:", error);
    }

}
function generateVerificationCode(length) {
    let code = '';
    const characters = '0123456789';  // You can add more characters (A-Z, a-z) if needed

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }

    return code;
}

async function userSendVerificationMail(req,res) {
    try {
        //const {email,password,confirmPassword,fullName,phoneNumber,address} = req.body;
        const userInput= req.body;
        console.log(userInput);
        

        const findUser = await userModel.findOne({email:userInput.email});

        if(findUser){
            return res.status(409).json({
                message:'email already exists'
            })
        }
        
        

              



        const randomCode = generateVerificationCode(6);
        await sendMail(userInput.email,"Email Verification",`this is ur verification Code : ${randomCode}`)
        await createVerification(userInput.email,`${randomCode}`);
        
        return res.status(200).json({
            message:'user aded sucssfully'
        })

     } catch (err) {
         res.json({
             message : err.message || err,
             error:true,
             success : false,
        })
    }  
}
async function registerVerification (req,res){
    const {email,code,userInput} = req.body;

    const verification = await Verification.findOne({email,code});

    if(!verification){
        return res.status(400).json({message:"invalid verification"});
    }
    
    return res.status(200).json({message:"User registered succesfully!"})
}
async function registerVerification(req, res) {
    const {  emaile,code, userInput } = req.body;
    

    try {
        const verification = await Verification.findOne({ email: emaile, code: code });

        console.log(verification);

        if (!verification) {
            return res.status(400).json({ message: "Invalid verification code." });
        }
        if (verification.expiresAt < new Date()) {
            return res.status(400).json({ message: "Verification code expired." });
        }
        

        // Create user after successful verification
        const newUser = new userModel(userInput);
        const savedUser = await newUser.save();

        // Remove verification record after successful registration
        await Verification.deleteOne({ email:emaile, code:code });

        return res.status(200).json({ message: "User registered successfully!", user: savedUser });

    } catch (error) {
        console.error("Error during verification:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}




module.exports = {registerVerification, userSendVerificationMail}
