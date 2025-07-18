const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const promptModel = require('../models/PromptModel');
const jwt = require('jsonwebtoken');

const generateLastPromptPdf = async (req, res) => {
  const id = parseInt(req.params.id);
  const lastPromptData = await promptModel.findOne().sort({ id: -1 }).limit(1).select('roadmap');
  const roadmapArray = lastPromptData?.roadmap || [];

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const normalFontBytes = fs.readFileSync(path.join(__dirname, '../fonts/NotoSansSymbols2-Regular.ttf'));
  const emojiFontBytes = fs.readFileSync(path.join(__dirname, '../fonts/SEGUIEMJ.TTF'));

  const textFont = await pdfDoc.embedFont(normalFontBytes);
  const emojiFont = await pdfDoc.embedFont(emojiFontBytes);

  const page = pdfDoc.addPage([595.28, 2000]);
  let y = 1900;
  const lineGap = 18;
  const leftMargin = 50;
  const indent = 20;
  const bottomMargin = 50;

  const addPageIfNeeded = () => {
    if (y < bottomMargin) {
      pdfDoc.addPage([595.28, 2000]);
      y = 1900;
    }
  };

  const drawLine = (text, indentX = 0, fontSize = 12, useEmoji = false) => {
    const currentFont = useEmoji ? emojiFont : textFont;
    const maxWidth = 480;
    const words = text.split(' ');
    let line = '';

    words.forEach(word => {
      const testLine = line + word + ' ';
      const testWidth = currentFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth) {
        addPageIfNeeded();
        page.drawText(line, {
          x: leftMargin + indentX,
          y,
          size: fontSize,
          font: currentFont,
          color: rgb(0, 0, 0),
        });
        y -= lineGap;
        line = word + ' ';
      } else {
        line = testLine;
      }
    });

    if (line.trim()) {
      addPageIfNeeded();
      page.drawText(line, {
        x: leftMargin + indentX,
        y,
        size: fontSize,
        font: currentFont,
        color: rgb(0, 0, 0),
      });
      y -= lineGap;
    }
  };

  // ✨ Title
  drawLine('📊 Roadmap Report', 0, 16, true);
  y -= 15;

  roadmapArray.forEach((phaseObj, idx) => {
    drawLine(`📍 ${phaseObj.phase}`, 0, 14, true);
    drawLine(`🛠 Goal: ${phaseObj.goal}`, indent);
    drawLine(`⏱ Duration: ${phaseObj.duration}`, indent);

    if (Array.isArray(phaseObj.steps) && phaseObj.steps.length > 0) {
      drawLine(`🗂 Steps:`, indent);
      phaseObj.steps.forEach(step => {
        drawLine(`• ${step}`, indent * 2);
      });
    }

    if (Array.isArray(phaseObj.platforms) && phaseObj.platforms.length > 0) {
      drawLine(`💻 Platforms: ${phaseObj.platforms.join(', ')}`, indent);
    }

    y -= 10; // Extra spacing between phases
  });

  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
  res.send(Buffer.from(pdfBytes));
};

// =======================================save result ============================

// save result to db when generatepdf->login->then this function is called
const saveResult = async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const aiData = req.body; // expecting full parsed JSON from frontend

    // Validate input as needed, e.g.
    if (!aiData || !aiData.topic || !Array.isArray(aiData.roadmap)) {
      return res.status(400).json({ error: "Invalid AI result data" });
    }

    // Prepare data similar to your fetchAPI logic
    const newPrompt = await promptModel.create({
      prompt_desc: aiData.topic,
      score: aiData.Score || '',
      worthbuilding: aiData.verdict || '',
      target_audience: aiData.audience || '',
      mvp_features: Array.isArray(aiData.mvpFeatureList) ? aiData.mvpFeatureList.join(",") : '',
      earning_potential: aiData.monthlyEarning || '',
      tech_stack: {
        frontend: aiData.TechStack ? aiData.TechStack[0] : '',
        backend: aiData.TechStack ? aiData.TechStack[1] : '',
        mobile_app: aiData.TechStack ? aiData.TechStack[2] : '',
        database: aiData.TechStack ? aiData.TechStack[3] : '',
        ai: aiData.TechStack ? aiData.TechStack[4] : '',
        auth: aiData.TechStack ? aiData.TechStack[5] : ''
      },
      usp: Array.isArray(aiData.USP) ? aiData.USP[0] : aiData.USP || '',
      problem_it_solves: aiData.realWorldProblem || '',
      timeline_to_first_revenue: aiData.Timeline_to_first_revenue || '',
      monetization_model: aiData.monetizationStrategy || '',
      roadmap: aiData.roadmap,
      user_id: decoded.id
    });
     console.log(newPrompt);
    res.json({ message: "AI result saved successfully", id: newPrompt._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save AI result" });
  }
};



//================================= generatePDF ===========================

// generate pdf is called when user is already logged in 

const generatePDF = async (req, res) => {
  const roadmapArray = req.body.roadmap || [];

  if (!Array.isArray(roadmapArray) || roadmapArray.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty roadmap data' });
  }
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const normalFontBytes = fs.readFileSync(path.join(__dirname, '../fonts/NotoSansSymbols2-Regular.ttf'));
  const emojiFontBytes = fs.readFileSync(path.join(__dirname, '../fonts/SEGUIEMJ.TTF'));

  const textFont = await pdfDoc.embedFont(normalFontBytes);
  const emojiFont = await pdfDoc.embedFont(emojiFontBytes);

  let page = pdfDoc.addPage([595.28, 2000]);
  let y = 1900;
  const lineGap = 18;
  const leftMargin = 50;
  const indent = 20;
  const bottomMargin = 50;

  const addPageIfNeeded = () => {
    if (y < bottomMargin) {
      page = pdfDoc.addPage([595.28, 2000]);
      y = 1900;
    }
  };

  const drawLine = (text, indentX = 0, fontSize = 12, useEmoji = false, color = rgb(0, 0, 0)) => {
    const currentFont = useEmoji ? emojiFont : textFont;
    const maxWidth = 480;
    const words = text.split(' ');
    let line = '';

    words.forEach(word => {
      const testLine = line + word + ' ';
      const testWidth = currentFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth) {
        addPageIfNeeded();
        page.drawText(line, {
          x: leftMargin + indentX,
          y,
          size: fontSize,
          font: currentFont,
          color,
        });
        y -= lineGap;
        line = word + ' ';
      } else {
        line = testLine;
      }
    });

    if (line.trim()) {
      addPageIfNeeded();
      page.drawText(line, {
        x: leftMargin + indentX,
        y,
        size: fontSize,
        font: currentFont,
        color,
      });
      y -= lineGap;
    }
  };

  // ✨ Title Section
  drawLine(`📊 Roadmap Report: ${req.body.topic}`, 0, 18, true, rgb(0.2, 0.4, 0.8));
  y -= 20;

  roadmapArray.forEach((weekObj, idx) => {
    // 📍 Week Title
    drawLine(`📍 ${weekObj.week}`, 0, 14, true, rgb(1, 0.5, 0));

    // 🛠 Goal
    drawLine(`🛠 Goal: ${weekObj.goal}`, indent, 12, false, rgb(0.1, 0.5, 0.1));

    // 🗂 Steps
    if (Array.isArray(weekObj.steps) && weekObj.steps.length > 0) {
      drawLine(`🗂 Steps:`, indent, 12, false, rgb(0.3, 0.3, 0.3));
      weekObj.steps.forEach(step => {
        drawLine(`• ${step}`, indent * 2, 11, false, rgb(0.4, 0.4, 0.4));
      });
    }

    // 💻 Platforms
    if (Array.isArray(weekObj.platforms) && weekObj.platforms.length > 0) {
      drawLine(`💻 Platforms: ${weekObj.platforms.join(', ')}`, indent, 12, false, rgb(0, 0.6, 0.6));
    }

    y -= 20; // Extra spacing between weeks
  });

  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=roadmap.pdf');
  res.send(Buffer.from(pdfBytes));
};


module.exports = { generatePDF,generateLastPromptPdf,saveResult };
