const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

//auth
exports.auth = async(req,res,next)=>{
    try {
        //Extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        //if token missing, then return res
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing"
            });
        }

        //Verify the token
        try {
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } 
        catch (error) {
            return res.status(401).json({
                success:false,
                message:'Token is invalid'
            });
        }
        next();
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:'Something went wrong while verifying the token, please try again'
        });
    }
}

//isStudent
exports.isStudent = async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Students only"
            })
        }
        next();
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:'Something went wrong while verifying the student role, please try again'
        });
    }
}

//isAdmin
exports.isAdmin = async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Admin only"
            })
        }
        next();
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:'Something went wrong while verifying the admin role, please try again'
        });
    }
}

//isInstructor
exports.isInstructor = async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Instructors only"
            })
        }
        next();
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:'Something went wrong while verifying the instructor role, please try again'
        });
    }
}