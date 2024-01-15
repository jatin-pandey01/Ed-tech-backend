const Profile = require('../models/Profile');
const User = require('../models/User');
const Course = require('../models/Course');

exports.updateProfile = async(req,res)=>{
    try {
        //Fetch data
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;
        const id = req.user.id;
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }

        //Find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        
        //Update profile, *** A new method to update *** 
        profileDetails.about = about;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            data:profileDetails,
        });
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while updating the profile, please try again"
        })
    }
}

//Delete account
exports.deleteAccount = async(req,res)=>{
    try {
        //Get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User Not Found",
            });
        }

        //Delete profile
        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        //delete or unenroll from all course
        for(let i=0;i<userDetails.courses.length;i++){
            await Course.findByIdAndUpdate(userDetails.courses[i],{$pull:{studentsEnrolled:id}});
        }

        //delete user
        await User.findByIdAndDelete(id);
        
        return res.status(200).json({
            success:true,
            message:"User deleted successfully"
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while deleting user, please try again."
        })
    }
}

//get All user details
exports.getAllUserDetails = async(req,res)=>{
    try {
        //Get id
        const id = req.user.id;

        const userDetails = await User.findById(id).populate('additionalDetails').exec();
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User Not Found",
            });
        }
        
        return res.status(200).json({
            success:true,
            message:"Data fetched successfully",
            data:userDetails,
        })        
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching user details, please try again."
        })
    }
}

exports.getEnrolledCourses = async(req,res)=>{
    try {
        const id = req.user.id;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"Sorry !!! User not found"
            });
        }    

        const enrolledCourses = await User.findById(id).populate({
                                        path:'courses',
                                        populate:({path:'courseContent'})
                                        }).populate('courseProgress').exec();
    } 
    catch (error) {
        
    }
}