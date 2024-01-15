const transporter = require('../config/transporter');

const mailSender = async(email,title,body) => {
    try {
        let info = await transporter.sendMail({
            from:'Study Notion by Jatin Pandey',
            to:email,
            subject:title,
            html:`<p>${body}</p>`,
        });
        console.log(info);
        return info;
    } 
    catch (error) {
        console.log("Error in sending mail");
        console.log(error.message);
    }
};

module.exports = mailSender;