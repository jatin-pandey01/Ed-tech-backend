const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const cloudinaryUploader = require('../utils/cloudinaryUploader');
require('dotenv').config();

exports.createSubSection = async(req,res)=>{
    try {
        //Fetch data
        const {sectionId,title,timeDuration,description} = req.body;
        const video = req.files.videoFile;
        
        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //upload video to cloudinary
        const videoUrl = await cloudinaryUploader(video, process.env.FOLDER_NAME, 50);

        const subSectionCreate = await SubSection.create({title, timeDuration, description, videoUrl:videoUrl.secure_url});
        const updateSection = await Section.findByIdAndUpdate(sectionId,{$push:{subSection:subSectionCreate._id}},{new:true}).populate('subSection').exec();

        return res.status(200).json({
            success:true,
            message:"Sub section created successfully",
            data:updateSection,
        });
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating sub section, please try again.",
        });
    }
}

//H.W : update subsection

//H.W : delete subsection