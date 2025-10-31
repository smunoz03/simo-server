const assert = require('assert');

// Sample data used in the test
const jdJson = require('./fixtures/jd.json');
const cvJson = require('./fixtures/cv.json');
const cvText = cvJson.cvExtractedText
  ? cvJson.cvExtractedText
  : cvJson.pages.map(page => page.text).join(' ');

// Stub models and helpers
const Job = {};

const User = { findById: async () => ({ cvExtractedText: cvText }) };

// Spy on compareWithChat but use the real implementation
const {
  compareWithChat: realCompareWithChat,
  getEmbedding: realGetEmbedding
} = require('../src/utils/geminiHelper');

const compareWithChat = async (jd, cv) => {
  compareWithChat.calls.push([jd, cv]);
  return await realCompareWithChat(jd, cv);
};
compareWithChat.calls = [];

// Inject stubs into require cache

const jobModelPath = require.resolve('../src/models/jobModel.js');
require.cache[jobModelPath] = { exports: Job };

const userModelPath = require.resolve('../src/models/userModel.js');
require.cache[userModelPath] = { exports: User };

const geminiHelperPath = require.resolve('../src/utils/geminiHelper.js');
require.cache[geminiHelperPath] = {
  exports: { compareWithChat, getEmbedding: realGetEmbedding }
};

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
  await validateCV(req, res, next);

  assert.strictEqual(Array.isArray(res.body), true);
  assert.strictEqual(compareWithChat.calls.length, 2);
  if (res.body.length > 0) {
    assert.ok(res.body[0].jobId);
    assert.strictEqual(typeof res.body[0].score, 'number');
  }
  console.log('bulk validateCV test passed');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
