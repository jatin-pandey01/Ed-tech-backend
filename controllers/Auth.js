const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const mailSender = require('../utils/mailSender');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//send otp
exports.sendOTP = async(req,res)=>{
    try {
        //fetch email from request body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});
        
        //if user already exist, then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered"
            });
        }

        //Generate OTP length of 6 number
        var otp = otpGenerator.generate(6,{upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});
        console.log('OTP => ',otp);
        
        //check unique otp or not, this is brute force approach. Find out unique otp generator
        var result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6,{upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});
            result = await OTP.findOne({otp});
        }

        //Create an entry for OTP
        const otpBody = await OTP.create({email,otp:otp});
        console.log(otpBody);

        return res.status(200).json({
            success:false,
            message:'OTP sent successfully'
        });

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error in OTP sending',
        })
    }
}


//signup
exports.signUp = async(req,res)=>{
    try {
        //Fetch data from request body
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp} = req.body;

        //validation data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !contactNumber || !otp){
            return res.status(403).json({
                success:false,
                message:'All fields are required',
            });
        }

        //Check password and confirmPassword are same or not
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password and Confirm password value does not match, please try again',
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already registered"
            });
        }

        //find most recent otp stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        //validate OTP
        if(recentOtp.length == 0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:"OTP not found"
            });
        }
        else if(recentOtp.otp !== otp){
            //Wrong otp
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(confirmPassword,10);

        //Create entry in DB
        const profileDetails = await Profile.create({
            gender:null,
            about:null,
            dateOfBirth:null,
            contactNumber:null
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //return res
        return res.status(200).json({
            success:true,
            message:'User is registered successfully',
            user,
        });

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error in registration. Please try again',
        });
    }
}


//login
exports.login = async(req,res)=>{
    try {
        //Fetch data from request body
        const {email,password} = req.body;

        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All field are required, please try again',
            });
        }

        //check user exist or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User is not registered, please signup first',
            });
        }

        //Generate JWT, after passoword match
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            };
            const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'2h'});
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            
            return res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            });
        }
        else{
            //password not matched
            return res.status(401).json({
                success:false,
                message:'Wrong password, please try again'
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failure, please try again'
        })   
    }
}


//change password.
exports.changePassword = async(req,res)=>{
    try {
        //Fetch data from request body
        const {email,oldPassword,newPassword,confirmNewPassword} = req.body;
        
        //validation data
        if(!email || !oldPassword || !newPassword || confirmNewPassword){
            return res.status(403).json({
                success:false,
                message:'All field are required, please try again',
            });
        }

        //check if newPassword === confirmNewPassword or not
        if(newPassword !== confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:'Password and Confirm password value does not match, please try again',
            });
        }

        //Check if newPassword !== oldPassword or not
        if(newPassword === oldPassword){
            return res.status(400).json({
                success:false,
                message:'Old Password and New Password are same, please enter new password',
            });
        }

        //Check user exist or not
        const existingUserser = await User.findOne({email});
        if(!existingUserser){
            return res.status(401).json({
                success:false,
                message:'User is not registered, please signup first',
            });
        }

        //encrpyt newPassword
        const hashedPassword = await bcrypt.hash(newPassword,10);
        
        //Update into, new:true means it will return updated document 
        const user = await User.findByIdAndUpdate({_id:existingUserser._id},{password:hashedPassword},{new:true});
        
        //sent mail to user for password changed
        const title = "Password changed successfully";
        const body = `Dear ${user.firstName} ${user.lastName}, Your Study Notion password has been changed successfully. Thank you`
        const mailResponse = mailSender(user.email,title,body);
        console.log(mailResponse);

        //return res
        return res.status(200).json({
            success:true,
            message:"Password has been changed successfully"
        });
        
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Error in change password, please try again."
        })
    }
}
