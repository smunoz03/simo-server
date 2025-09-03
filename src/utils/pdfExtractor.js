const fs = require('fs');
const path = require('path');

// Cleans and normalizes extracted text
function cleanText(original) {
  if (!original) return '';

  let text = String(original);

  // Normalize newlines to \n first
  text = text.replace(/\r\n?/g, '\n');

  // Undo hyphenation that occurs at line breaks: word-\nnext -> wordnext
  // Includes standard hyphen "-" and Unicode hyphens \u2010, non‑breaking hyphen \u2011
  text = text.replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])[-\u2010\u2011]\s*\n\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1$2');

  // Replace tabs and newlines with spaces
  text = text.replace(/[\t\n]+/g, ' ');

  // Convert non‑breaking space to regular space
  text = text.replace(/\u00A0/g, ' ');

  // Remove zero‑width and BOM characters
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Remove other non‑printable control chars (keep standard whitespace handled above)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Collapse multiple spaces
  text = text.replace(/\s{2,}/g, ' ');

  // Trim edges
  text = text.trim();

  return text;
}

let extractText;

if (global.extractText) {
  extractText = global.extractText;
} else {
  const pdfParse = require('pdf-parse');

  extractText = async (pdfPath) => {
    const dataBuffer = fs.readFileSync(pdfPath);

    // Use a custom pagerender to build page text more explicitly before cleaning
    const options = {
      pagerender: async (pageData) => {
        const textContent = await pageData.getTextContent();
        // Join items with spaces and pre-normalize intra-item whitespace
        const strings = textContent.items.map((it) => String(it.str || '').replace(/\s+/g, ' ').trim());
        // Reconstruct page text with spaces (line/paragraph boundaries will be normalized by cleaner)
        let pageText = strings.join(' ');
        return pageText + '\n'; // keep a delimiter between pages pre-cleaning
      },
    };

    const { text } = await pdfParse(dataBuffer, options);

    // Clean and normalize extracted text (removes \n, tabs, control chars, etc.)
    const cleaned = cleanText(text);

    const jsonPath = pdfPath.replace(/\.pdf$/i, '.json');
    const payload = { cvExtractedText: cleaned };
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
    return cleaned;
  };
}

module.exports = { extractText };
