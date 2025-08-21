const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Make path and fs available globally since jobController expects them
global.path = path;
global.fs = fs;

// Read sample files
const jdPath = path.join(__dirname, 'fixtures/jd.json');
const cvPath = path.join(__dirname, 'fixtures/cv.pdf');
const jdText = JSON.parse(fs.readFileSync(jdPath, 'utf8')).jdExtractedText;
const cvText = 'Sample CV text';

// Stub models and helpers
const Job = {
  findById: async () => ({ jdExtractedText: jdText })
};
const userDoc = {
  cvFile: 'tests/fixtures/cv.pdf',
  async save() { this.saved = true; }
};
const User = {
  findById: async () => userDoc
};
global.User = User;

global.extractText = async filePath => {
  if (filePath === cvPath) {
    return cvText;
  }
  throw new Error('Unexpected file path');
};

const compareWithChat = async (jd, cv) => {
  compareWithChat.calledWith = [jd, cv];
  return { canApply: true, score: 95, reasons: ['match'] };
};

// Inject stubs into require cache
const jobModelPath = path.join(__dirname, '../src/models/jobModel.js');
require.cache[jobModelPath] = { exports: Job };

const geminiHelperPath = path.join(__dirname, '../src/utils/geminiHelper.js');
require.cache[geminiHelperPath] = { exports: { compareWithChat, getEmbedding: () => {} } };

// Now require the controller
const { validateCV } = require('../src/controllers/jobController');

(async () => {
  const req = { params: { jobId: '1' }, session: { userId: 'u1' } };
  const res = { json: data => { res.body = data; } };
  const next = err => { throw err; };

  await validateCV(req, res, next);

  assert.deepStrictEqual(compareWithChat.calledWith, [jdText, cvText]);
  assert.strictEqual(res.body.jobId, '1');
  assert.strictEqual(res.body.userId, 'u1');
  assert.strictEqual(res.body.canApply, true);
  assert.strictEqual(userDoc.cvExtractedText, cvText);
  assert.strictEqual(userDoc.saved, true);
  console.log('validateCV test passed');
})();
