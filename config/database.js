const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = ()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=>console.log("Database Connection established successfully"))
    .catch((error)=>{
        console.log("Database connection failed");
        console.error(error);
        process.exit(1);
    });
};

module.exports = connectDatabase;