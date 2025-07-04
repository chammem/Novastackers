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

async function generateOtp(req,res) {
    const { email } = req.body;

    try {
      // Check if the email exists in the User collection
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email not found. Please check your email address.',
        });
      }
  
    
      const otp = generateVerificationCode(6);
  
      
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
  
      
      let verification = await Verification.findOne({ email });
  
      if (verification) {
        
        verification.code = otp;
        verification.expiresAt = expiresAt;
      } else {
        
        verification = new Verification({
          email,
          code: otp,
          expiresAt,
        });
      }
  
      await verification.save();
  
      
      const subject = 'Your OTP for Password Reset';
      const text = `Your OTP is: ${otp}. This OTP is valid for 10 minutes.`;
  
      await sendMail(email, subject, text);
  
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully. Please check your email.',
      });
    } catch (error) {
      console.error('Error requesting OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again later.',
      });
    }

}
async function userSendVerificationMail(req,res) {
    try {
       
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
// async function registerVerification (req,res){
//     const {code,userInput} = req.body;

//     const verification = await Verification.findOne({email:userInput.email,code:code});

//     if(!verification){
//         return res.status(400).json({message:"invalid verification"});
//     }
    
//     return res.status(200).json({message:"Verification sent to you email"})
// }
async function registerVerification(req, res) {
    const { code, userInput } = req.body;
    
    console.log(userInput.email);
    console.log(code);
    try {
        const verification = await Verification.findOne({ email:userInput.email,code:code });

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
        await Verification.deleteOne({ email:userInput.email,code:code });

        return res.status(200).json({ message: "User registered successfully!", user: savedUser });

    } catch (error) {
        console.error("Error during verification:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

async function verifyOtp(req,res){
    const { email, otp } = req.body;
    try {
       
        const verification = await Verification.findOne({ email });
    
        if (!verification) {
          return res.status(404).json({
            success: false,
            message: 'No OTP found for this email. Please request a new OTP.',
          });
        }
    
       
        if (verification.expiresAt < new Date()) {
          return res.status(400).json({
            success: false,
            message: 'OTP has expired. Please request a new OTP.',
          });
        }
    
        
        if (verification.code !== otp) {
          return res.status(400).json({
            success: false,
            message: 'Invalid OTP. Please check your OTP and try again.',
          });
        }
    
        
        await Verification.deleteOne({ email });
    
        res.status(200).json({
          success: true,
          message: 'OTP verified successfully.',
        });
      } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to verify OTP. Please try again later.',
        });
      }

}
async function resetPassword(req, res) {
  const { email, password } = req.body;

  try {
      const user = await userModel.findOne({ email });

      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found. Please check your email address.',
          });
      }

      user.password = password;
      await user.save();

      return res.status(200).json({
          success: true,
          message: 'Password reset successfully.',
      });
  } catch (error) {
      console.error('Error resetting password:', error);
      return res.status(500).json({
          success: false,
          message: 'Failed to reset password. Please try again later.',
      });
  }
}




module.exports = {resetPassword,verifyOtp,registerVerification, userSendVerificationMail,generateOtp}
