const bcrypt = require('bcryptjs');
const userModel = require("../../models/userModel");
const jwt = require('jsonwebtoken');

async function userSignInController(req, res) {
    try {
        const { email, password } = req.body;

        if(!email){
            throw new Error("please provide your email")
        }
        if(!password){
            throw new Error("please provide your password")
        }

        const user = await userModel.findOne({email})

        if(!user){
            throw new Error("User not found !")
        }

        // Vérifier si l'utilisateur est désactivé
        if (user.isDisabled) {
            throw new Error("Your account has been disabled.");
        }

        const checkPassword =await bcrypt.compare(password,user.password)

        console.log("checkPassword",checkPassword)

        if(checkPassword){
            const tokenData = {
                _id : user._id,
                email : user.email,
            }
            const token =await jwt.sign(tokenData,
                 process.env.TOKEN_SECRET_KEY,
                 {expiresIn: 60 * 60 * 12});
            
            const tokenOption = {
                httpOnly : true,
                secure : true
            }
        
            res.cookie("token",token,tokenOption).json({
                message : "logged in successfully",
                data : token,
                success : true,
                error : false
            })

        }else{
            throw new Error ("please check your password")
        }
        
    } catch (err) {
        res.json({ 
            message: err.message || err, 
            error: true, 
            success: false 
        });
    }
}

module.exports = userSignInController;
