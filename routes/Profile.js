const express = require("express");
const router = express.Router();

//Import required controllers and middleware functions
const {updateProfile, deleteAccount, getAllUserDetails} = require('../controllers/Profile');