const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');

//reset Password Token
exports.resetPasswordToken = async(req,res)=>{
    try {
        // Get email from req body;
        const {email} = req.body;
        
        //check user for this email, email validation
        const user = User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Sorry, email isn't registered. Please sign up"
            });
        }

        //generate random token
        const token = crypto.randomUUID(); //used to generate a random RFC 4122 

        //Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email},{token:token,resetPasswordExpires:Date.now()+5*60*1000},{new:true});

        //Create URL, here localhost:3000 means ui part
        const url = `http://localhost:3000/update-password/${token}`;

        //send mail containing the url
        const mailResponse = await mailSender(email,"Password Reset Link",
                                        `Password Reset Link : ${url}`);
        
        return res.status(200).json({
            success:true,
            message:"Email sent successfully, please check email and change password",
        });
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            error,
            message:'Something went wrong while sending reset password link, please try again'
        });
    }
}


//Reset password
exports.resetPassword = async(req,res)=>{
    try {
        //data fetch
        const {password,confirmPassword,token} = req.body;
        
        //validation
        if(!password !== confirmPassword){
            return res.status(403).json({
                success:false,
                message:"Password not matched, please correct it."
            })
        }

        //get userdetails from db using token
        const userDetails = await User.findOne({token});

        //if no entry
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token or Link is invalid"
            });
        }

        //Check token time
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"Link has been expired, please regenerate the link."
            })
        }

        //hashed password
        const hashedPassword = await bcrypt.hash(password,10);

        //update password
        const updatedPassword = await User.findOneAndUpdate({token},{password:hashedPassword},{new:true});
        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })
    } 
    catch (error) {
        
    }
}