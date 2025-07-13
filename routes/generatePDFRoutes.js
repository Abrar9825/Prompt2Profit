const express=require("express");

const router=express.Router();
const {saveResult,generatePDF,generateLastPromptPdf}=require("../controllers/generatePDFController");

router.post('/save-result', saveResult);
router.post("/generate-pdf",generatePDF);
router.post("/generate-lastPromptPdf",generateLastPromptPdf);

module.exports=router;