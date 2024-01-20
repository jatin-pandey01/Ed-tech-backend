const express = require("express")
const router = express.Router()
const {auth,isAdmin,isInstructor,isStudent} = require("./../middlewares/auth");

const {
    updateProfile,
    getAllUserDetails,
    getEnrolledCourses,
    deleteAccount,
} = require("../controllers/Profile");

router.put("/updateProfile" , auth , updateProfile);
router.get("/getUserDetails" , auth , getAllUserDetails);
router.delete("/deleteProfile" , auth , deleteAccount);
router.get("/getEnrolledCourse" , auth , getEnrolledCourses);


// const {
//   deleteAccount,
//   updateProfile,
//   getAllUserDetails,
//   updateDisplayPicture,
//   getEnrolledCourses,
//   instructorDashboard,
// } = require("../controllers/Profile")
// const { isDemo } = require("../middlewares/demo");

// // ********************************************************************************************************
// //                                      Profile routes
// // ********************************************************************************************************
// // Delet User Account
// router.delete("/deleteProfile",auth,isDemo,deleteAccount)
// router.put("/updateProfile", auth,isDemo, updateProfile)
// router.get("/getUserDetails", auth, getAllUserDetails)
// // Get Enrolled Courses
// router.get("/getEnrolledCourses", auth, getEnrolledCourses)
// router.put("/updateDisplayPicture", auth,isDemo, updateDisplayPicture)
// //get instructor dashboard details
// router.get("/getInstructorDashboardDetails",auth,isInstructor, instructorDashboard)

// module.exports = router;