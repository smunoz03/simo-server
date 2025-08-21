const assert = require('assert');

// Sample data used in the test
const jdJson = require('./fixtures/jd.json');
const cvJson = require('./fixtures/cv.json');
const cvText = cvJson.pages.map(page => page.text).join(' ');

// Stub models and helpers
const Job = {};

const User = { findById: async () => ({ cvExtractedText: cvText }) };

  const compareWithChat = async (jd, cv) => {
    compareWithChat.calls.push([jd, cv]);
    const score = compareWithChat.mockScores.shift() ?? 95;
    return { canApply: true, score, reasons: ['match'] };
  };
  compareWithChat.calls = [];
  compareWithChat.mockScores = [];

// Inject stubs into require cache

const jobModelPath = require.resolve('../src/models/jobModel.js');
require.cache[jobModelPath] = { exports: Job };

const userModelPath = require.resolve('../src/models/userModel.js');
require.cache[userModelPath] = { exports: User };

const geminiHelperPath = require.resolve('../src/utils/geminiHelper.js');
require.cache[geminiHelperPath] = { exports: { compareWithChat, getEmbedding: () => {} } };

// Now require the controller
const { validateCV } = require('../src/controllers/jobController');

(async () => {
  const next = err => { throw err; };

  // Bulk evaluation
  Job.find = async () => [
    { _id: 'j1', jdExtractedJson: jdJson },
    { _id: 'j2', jdExtractedJson: jdJson }
  ];

  const req = { params: {}, session: { userId: 'u1' } };
  const res = {
    json: data => { res.body = data; },
    status: () => res
  };

  compareWithChat.calls = [];
  compareWithChat.mockScores = [95, 60];
  await validateCV(req, res, next);

  assert.strictEqual(Array.isArray(res.body), true);
  assert.strictEqual(res.body.length, 1);
  assert.deepStrictEqual(res.body[0].jobId, 'j1');
  assert.strictEqual(res.body[0].score >= 70, true);
  assert.strictEqual(compareWithChat.calls.length, 2);
  console.log('bulk validateCV test passed');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
