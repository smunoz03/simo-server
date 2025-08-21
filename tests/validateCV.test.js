const assert = require('assert');

// Sample data used in the test
const jdJson = require('./fixtures/jd.json');
const cvJson = require('./fixtures/cv.json');
const cvText = cvJson.pages.map(page => page.text).join(' ');

// Stub models and helpers
const Job = {
  findById: async () => ({ jdExtractedJson: jdJson })
};

const User = { findById: async () => ({ cvExtractedText: cvText }) };

const compareWithChat = async (jd, cv) => {
  compareWithChat.calledWith = [jd, cv];
  return { canApply: true, score: 95, reasons: ['match'] };
};

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
  const req = { params: { jobId: '1' }, session: { userId: 'u1' } };
  const res = {
    json: data => { res.body = data; },
    status: () => res
  };
  const next = err => { throw err; };

  await validateCV(req, res, next);

  assert.deepStrictEqual(compareWithChat.calledWith, [JSON.stringify(jdJson), cvText]);
  assert.strictEqual(res.body.jobId, '1');
  assert.strictEqual(res.body.userId, 'u1');
  assert.strictEqual(res.body.canApply, true);
  console.log('validateCV test passed');

})();
