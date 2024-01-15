const RatingAndReview = require("../models/RatingAndReview");
const User = require("../models/User");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// Create rating
exports.createRating = async(req,res)=>{
    try {
        //get user id
        const userId = req.user.id;
        
        //fetch from request body
        const {rating,review,courseId} = req.body;

        //check if user is enrolled
        const courseDetails = await Course.findById(courseId);
        if(!courseDetails.studentsEnrolled.includes(userId)){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in this course."
            });
        }

        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({user:userId,course:courseId});
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user."
            });
        }

        const ratingReview = await RatingAndReview.create({user:userId, rating:rating,review:review,course:courseId});
        courseDetails.ratingAndReviews.push(ratingReview._id);
        const updateCourse = await courseDetails.save();

        return res.status(200).json({
            success:true,
            message:"Rating and Raview created Successfully",
            data:ratingReview,
        });
    }
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating Rating and Review."
        });
    }
}


// Get average rating
exports.getAverageRating = async(req,res)=>{
    try {
        //Get course id
        const {courseId} = req.body;

        //calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{ //Find out whose course key is match with this objectId
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                //Means jo bhi id aaye hai un sabko ek single grp me wrap kar diya
                $group:{
                    _id:null,
                    averageRating : {$avg:"$rating"} //Here it will give avg of all rating
                }
            }
        ]);

        if(result.length > 0){ //Means have some rating
            return res.status(200).json({
                success:true,
                message:"Got rating successfylly",
                data:result[0].averageRating,
            })
        }
        else{
            return res.status(200).json({
                success:true,
                message:"No rating",
                data:0,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server issue in fetching avg rating."
        });
    }
}


// Get all rating and review
exports.getAllRatingAndReview = async(req,res)=>{
    try {
        const allRatingAndReview = await RatingAndReview.find({}).sort({rating:"desc"}).populate({
                                        path:"user",
                                        select:"firstName lastName email image"
                                    }).populate({
                                        path:"course",
                                        select:"courseName",
                                    }).exec();
                
        return res.status(200).json({
            success:true,
            message:"All Rating and Review fetched successfully",
            data:allRatingAndReview,
        })
    }
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error, please try again."
        });
    }
}
