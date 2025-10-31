/**
 * Job controller - handles HTTP requests for job matching
 * @module controllers/jobController
 */

const jobService = require('../services/jobService');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * @desc   Find all jobs that match current user's CV
 * @route  GET /api/jobs/matches
 * @access Private (requires session)
 */
exports.validateCV = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const matches = await jobService.findMatchingJobsForUser(userId);

    sendSuccess(res, 200, { matches, count: matches.length });
  } catch (err) {
    next(err);
  }
};
