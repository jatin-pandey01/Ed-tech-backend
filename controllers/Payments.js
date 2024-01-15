const Razorpay = require('razorpay');
const instance = require('../config/razorpay');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const Course = require('../models/Course');
const mongoose = require('mongoose');
//courseEnrollment

//capture the payment and initiate razorpay order
exports.capturePayment = async(req,res)=>{
    try {
        //Fetch userId and courseId
        const {courseId} = req.body;
        const userId = req.user.id;
        
        //validation
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"Please provide valid course id"
            });
        }

        //valid courseDetails
        const courseDetails = await Course.findById(courseId);
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Could not find the course"
            });
        }

        //User have already payed or not
        const newUserId = new mongoose.Types.ObjectId(userId); //This is a way to convert userId into objectId
        if(courseDetails.studentsEnrolled.includes(newUserId)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled",
            })
        }

        //order create
        const amount = courseDetails.price * 100;
        const currency = "INR";
        const options = {
            amount,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId,
                userId,
            }
        }
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        
        return res.status(200).json({
            success:true,
            courseName:courseDetails.courseName,
            courseDescription:courseDetails.courseDescription,
            thumbnail:courseDetails.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong in payment",
        })
    }
}

//verify Signature of Razorpay and Server
exports.verifySignature = async(req,res)=>{
    const webhookSecret = "1234567890";
    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex"); //Means output of encryption

    if(signature === digest){
        console.log("Payment is authorized");
        const {courseId,userId} = req.body.payload.payment.entity.notes;

        try {
            //Add student in course and add course in student
            const enrolledCourse = await Course.findByIdAndUpdate(courseId,{$push:{studentsEnrolled:userId}},{new:true});

            if(!enrolledCourse){
                return res.status(404).json({
                    success:false,
                    message:"Course not found",
                });
            }

            const addCourse = await User.findByIdAndUpdate(userId,{$push:{courses:courseId}},{new:true});

            if(!addCourse){
                return res.status(404).json({
                    success:false,
                    message:"Student not found",
                });
            }

            const title = `You have enrolled successfully in ${enrolledCourse.courseName}`;
            const body = `Dear ${addCourse.firstName}, You have enrolled successfully in ${enrolledCourse.courseName}.`;
            const mailResponse = mailSender(addCourse.email,title,body);

            return res.status(200).json({
                success:true,
                message:"Signature verified and course added",
            });
        } 
        catch (error) {
            return res.status(500).json({
                success:false,
                message:"Something went wrong in signature varification"
            });
        }
    }
    else{
        return res.status(401).json({
            success:false,
            message:"Invalid request",
        })
    }
}