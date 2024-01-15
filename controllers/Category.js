const Category = require('../models/Category');

exports.createCategory = async(req,res)=>{
    try {
        //fetch data
        const {name,description} = req.body;

        //validation
        if(!name || !description){
            return res.status(403).json({
                success:false,
                message:"Please write name and description both"
            })
        }

        //Data entry
        const categoryDetails = await Category.create({name,description});
        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
        });
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:`Error in Tag creation : ${error.message}`,
        });
    }
}


//Get All Category
exports.showAllCategory = async(req,res)=>{
    try {
        //Return all tags which has name and description
        const allCategories = await Category.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            data:allCategories,
        })
    }
    catch (error) {
        return res.status(500).json({
            success:false,
            message:`Error in Show all Categories : ${error.message}`,
        });
    }
}


//Category page details
exports.categoryPageDetails = async(req,res)=>{
    try {
        //Get category ID
        const {categoryId} = req.body;

        //Get courses for specified category
        const selectedCategory = await Category.findById({categoryId}).populate("course").exec();
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data Not Found",
            });
        }

        //Get courses for different category, $ne : Not Equal and $eq : Equal
        const differentCategories = await Category.find({_id:{$ne:categoryId}}).populate("course").exec(); // Not equal to this category Id

        //Get top selling courses
        const topCourses = differentCategories.course.sort({studentsEnrolled:"desc"});

        return res.status(200).json({
            success:true,
            data:{selectedCategory,differentCategories,topCourses},
            message:"Fetched successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Issue,please try again.",
        });
    }
}
