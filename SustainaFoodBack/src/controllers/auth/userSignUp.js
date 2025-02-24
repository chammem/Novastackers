const userModel = require("../../models/userModel");

const bcrypt = require('bcryptjs');


async function userSignUpController(req,res) {
    try {
        const {email,password,fullName} = req.body

        // Debugging logs
    console.log(userModel); // Should log the Mongoose model
    console.log(typeof userModel.findOne); // Should log 'function'

        const user = await userModel.findOne({email})

        console.log("user", user)

        if(user){
            throw new Error("this email is already used")
        }

        if(!email){
            throw new Error("please provide your email")
        }
        if(!password){
            throw new Error("please provide your password")
        }
        if(!fullName){
            throw new Error("please provide your username")
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(password, salt);

        if(!hashPassword){
            throw new Error("something went wrong")
        }

        const payload={
            ...req.body,
            password : hashPassword
        }

        const userData = new userModel(payload)
        const saveUser =await userData.save()

        res.status(201).json({
            data : saveUser,
            success : true,
            error : false,
            message: "User registered successfully"
        })
    } catch (err) {
        res.json({
            message : err.message || err,
            error:true,
            success : false,
        })
    }  
}

module.exports =userSignUpController