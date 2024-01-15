const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async(req,res)=>{
    try {
        //Data fetch
        const {sectionName,courseId} = req.body;
        
        //Data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Please fill all details"
            });
        }

        //Create section
        const newSection = await Section.create({sectionName:sectionName});

        //Update course with section objectId
        const updatedCourse = await Course.findByIdAndUpdate(courseId,{$push:{courseContent:newSection._id}},{new:true});
        //H.W : populate updatedCourse in such a way, we get section and Sub Section both

        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            data:updatedCourse,
        })

    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create section, please try again",
        })
    }
}

//Section updation
exports.updateSection = async(req,res)=>{
    try {
        //Fetch data 
        const {sectionName,sectionId} = req.body;
        
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Please fill all details"
            });
        }

        //Update data
        const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
        });
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update section, please try again",
        })
    }
}

//delete section
exports.deleteSection = async(req,res)=>{
    try {
        //Fetch data - assuming that we are sending ID in params
        const {sectionId} = req.params;

        //Find by Id and Delete
        await Section.findByIdAndDelete(sectionId);

        const updateCourse = Course.findByIdAndUpdate(sectionId,{$pull:{courseContent:sectionId}},{new:true});
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
        })
    }
}