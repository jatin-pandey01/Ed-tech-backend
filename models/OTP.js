const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60*1000, //5 minutes
    }
});

//a function to send emails
async function sendVerificationEmail(email,otp){
    try {
        const mailResponse = mailSender(email,"Verification email from study notion",`OTP : ${otp}`);
        console.log("Email sent successfully => ",mailResponse);
    }
    catch (error) {
        console.log(`Error in sending verification mail in OTP model : ${error}`);
        throw error;
    }
}

otpSchema.pre('save',async function(next){ //Since it is not saved so that's why we cannot use doc and next means for moving next function or middleware
    await sendVerificationEmail(this.email,this.otp);
    next();
});

module.exports = mongoose.model('OTP',otpSchema);