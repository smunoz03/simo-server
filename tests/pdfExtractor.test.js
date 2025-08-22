const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Stub pdf-parse before requiring pdfExtractor
const pdfParsePath = require.resolve('pdf-parse');
require.cache[pdfParsePath] = {
  exports: async () => ({ text: 'line1\nline2' })
};

const { extractText } = require('../src/utils/pdfExtractor');

const dummyPdfPath = path.join(__dirname, 'fixtures', 'dummy.pdf');
fs.writeFileSync(dummyPdfPath, 'dummy');

(async () => {
  try {
    const defaultText = await extractText(dummyPdfPath);
    assert.strictEqual(defaultText, 'line1 line2');

    const pipeText = await extractText(dummyPdfPath, '|');
    assert.strictEqual(pipeText, 'line1|line2');

    const jsonPath = dummyPdfPath.replace(/\.pdf$/i, '.json');
    const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.strictEqual(payload.cvExtractedText, 'line1|line2');

    fs.unlinkSync(dummyPdfPath);
    fs.unlinkSync(jsonPath);
    console.log('pdfExtractor newline filter test passed');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
