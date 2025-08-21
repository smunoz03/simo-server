const fs = require('fs');
const path = require('path');

let extractText;

if (global.extractText) {
  extractText = global.extractText;
} else {
  const pdfParse = require('pdf-parse');

  extractText = async (pdfPath) => {
    const dataBuffer = fs.readFileSync(pdfPath);
    const { text } = await pdfParse(dataBuffer);
    const jsonPath = pdfPath.replace(/\.pdf$/i, '.json');
    const payload = { cvExtractedText: text };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
    return text;
  };
}

module.exports = { extractText };
