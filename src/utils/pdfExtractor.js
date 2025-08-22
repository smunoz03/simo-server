const fs = require('fs');
const path = require('path');

let extractText;

if (global.extractText) {
  extractText = global.extractText;
} else {
  const pdfParse = require('pdf-parse');

  /**
   * Extract text from a PDF file and replace newline characters with the
   * provided delimiter (default is a space).
   *
   * @param {string} pdfPath - Absolute path to the PDF file.
   * @param {string} [delimiter=' '] - Delimiter used to replace newlines.
   * @returns {Promise<string>} The extracted, filtered text.
   */
  extractText = async (pdfPath, delimiter = ' ') => {
    const dataBuffer = fs.readFileSync(pdfPath);
    const { text } = await pdfParse(dataBuffer);
    const filteredText = text.replace(/\r?\n/g, delimiter);
    const jsonPath = pdfPath.replace(/\.pdf$/i, '.json');
    const payload = { cvExtractedText: filteredText };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
    return filteredText;
  };
}

module.exports = { extractText };
