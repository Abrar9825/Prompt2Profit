const express=require("express");

const router=express.Router();
const {generatePDF,generateLastPromptPdf}=require("../controllers/generatePDFController");


router.post("/generate-pdf/:id",generatePDF);
router.post("/generate-lastPromptPdf",generateLastPromptPdf);

module.exports=router;