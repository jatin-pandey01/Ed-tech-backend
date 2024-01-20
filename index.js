const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
require("dotenv").config();

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors"); //Used to run both(Frontend and Backend on the same Port number)
const cloudinaryConnect = require("./config/cloudinary").cloudinaryConnect;
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000 ;

database();

//Middleware
app.use(cookieParser());
app.use(express.json()); 
app.use(
  cors(
    {
      origin:`http://localhost:${PORT}`,
      credentials:true,
    }
  )
);
app.use(fileUpload({
  useTempFiles:true,
  tempFileDir:'/tmp/',
}));

cloudinaryConnect();

app.get("/",(req,res)=>{
  return res.json({
    success:true,
    message:"Server Started on Default Route",
  });
});

app.listen(PORT, ()=>{
  console.log(`App is started running on ${PORT} port`);
});

// app.use("/api/v1/auth",userRoutes);
// app.use("/api/v1/profile",profileRoutes);
// app.use("/api/v1/course",courseRoutes);
// app.use("/api/v1/payment",paymentRoutes);