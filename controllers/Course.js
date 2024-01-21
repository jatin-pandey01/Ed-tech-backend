const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const cloudinaryUploader = require('../utils/cloudinaryUploader');
require('dotenv').config();

//create course handler function
exports.createCourse = async(req,res)=>{
    try {
        //Fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,category} = req.body;

        //Get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail ){
            return res.status(400).json({
                success:false,
                message:"All fields are required, please fill all details"
            })
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Detail => ",instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:"Instructor Details not found",
            });
        }

        //Check given tag is valid or not
        const categoryDetails = Category.findById(category);

        if(!categoryDetails){
            return res.status(400).json({
                success:false,
                message:"Tag Details not found",
            });
        }

        //Upload image to cloudinary
        const thumbnailImage = await cloudinaryUploader(thumbnail,process.env.FOLDER_NAME);

        //Create an Entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorDetails._id,
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });

        //Add the new course to the user schema of Instructor
        const instructorUpdate =  await User.findByIdAndUpdate({_id:instructorDetails._id},{$push:{courses:newCourse._id}},{new:true});

        //Update the Tag Schema
        const tagUpdate = await Category.findByIdAndUpdate({_id:categoryDetails._id},{$push:{course:newCourse._id}},{new:true});

        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating course, please try again."
        })
    }
}


//Show all courses
exports.showAllCourses = async(req,res)=>{
    try {
        const allCourses = await Course.find({},{courseName:true,price:true,thumbnail:true,instructor:true,ratingAndReviews:true,studentsEnrolled:true}).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch all course data, please try again",
        })
    }
}


//getCourseDetails
exports.getCourseDetails = async(req,res)=>{
    try {
        //Get course ID
        const {courseId} = req.body;
        
        //Find course details, User aur user me additional details ko bhi populate karo
        const courseDetails = await Course.findById(courseId).populate({
                                    path:"User",
                                    populate:({path:"additionalDetails"})
                                    }).populate({
                                        path:"Section",
                                        populate:({path:"SubSection"})
                                    }).populate("RatingAndReview").populate("Category").exec();
        
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`
            });
        }

        return res.status(200).json({
            success:true,
            message:"Course details fetch successfully",
            data:courseDetails,
        });
    }
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching data, please try again",
        });
    }
}

