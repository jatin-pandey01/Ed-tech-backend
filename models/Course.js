const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName:{
        type:String,
        trim:true,
        required:true,
    },
    courseDescription:{
        type:String,
        trim:true,
        required:true,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    whatYouWillLearn:{
        type:String,
        trim:true,
    },
    courseContent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Section'
    }],
    ratingAndReviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RatingAndReview',
    }],
    price:{
        type:Number,
    },
    thumbnail:{
        type:String
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    studentsEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    }]
});

module.exports = mongoose.model('Course',courseSchema);