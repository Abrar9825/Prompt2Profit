const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const promptModel = require('../models/PromptModel');

//generateLastPromptPdf
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



//generatePDF
const generatePDF = async (req, res) => {
  const id = parseInt(req.params.id);
  const promptData = await promptModel.findOne({ id }).select('roadmap');
  const roadmapArray = promptData?.roadmap || [];

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

module.exports = { generatePDF,generateLastPromptPdf };
