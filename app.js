// here we dont use axios we use sdk call i.e, generative-ai
// const axios = require('axios');
// we use _id(object) for identification of user and not id(number)
require("dotenv").config();
const express=require("express");
const session = require('express-session');

// To write file paths that work on all operating systems (Windows, Linux, macOS) — because different OSes use different path separators (\ vs /).
const path = require('path'); 
const app=express();

// here we are getting db.js 
require('./config/db');

//parse incoming form data (from HTML <form>) and make it available in req.body
app.use(express.urlencoded({ extended: true })); 

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Serve static files from "views" folder
app.use('/views',express.static(path.join(__dirname, "views")));

app.use('/css',express.static(path.join(__dirname, 'css')));

// routes defined
const fetchAPIRoutes=require("./routes/fetchAPIRoutes");
const generatePDFRoutes=require("./routes/generatePDFRoutes");
const UserRoute=require("./routes/UserRoute");

// routes used
app.use(express.json());
app.use("/api",fetchAPIRoutes);
app.use("/generate",generatePDFRoutes);
app.use("/user",UserRoute);


const PORT=process.env.PORT || 3000;


// below we are making views folder public so that browser can access any file
app.use(express.static(path.join(__dirname, 'views')));




app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});