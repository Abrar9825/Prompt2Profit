const express=require("express");

const router=express.Router();
const {fetchAPI}=require("../controllers/fetchAPIController");
//const verifyToken = require('../middleware/authMiddleware');


router.post("/ask",fetchAPI);


module.exports=router;