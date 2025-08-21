const fs = require('fs');
const path = require('path');

let extractText;

if (global.extractText) {
  extractText = global.extractText;
} else {
  /**
   * Lazily require pdf-parse so the module doesn't crash on startup
   * if the optional dependency isn't installed. A clear error message
   * is thrown when extraction is attempted without pdf-parse.
   */
  extractText = async (pdfPath) => {
    let pdfParse;
    try {
      pdfParse = require('pdf-parse');
    } catch (err) {
      throw new Error(
        'pdf-parse module is required to extract text. Install it with "npm install pdf-parse".'
      );
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const { text } = await pdfParse(dataBuffer);
    const jsonPath = pdfPath.replace(/\.pdf$/i, '.json');
    const payload = { cvExtractedText: text };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
    return text;
  };
}

module.exports = { extractText };
