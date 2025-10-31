/**
 * Job service - handles job matching and comparison logic
 * @module services/jobService
 */

const Job = require('../models/jobModel');
const User = require('../models/userModel');
const { compareWithChat } = require('../utils/geminiHelper');
const { JOB_MATCH_SCORE_THRESHOLD } = require('../config/constants');

/**
 * Compare a CV against a job description
 * @param {string} cvText - Extracted CV text
 * @param {string} jdText - Job description text or JSON string
 * @returns {Promise<Object>} Comparison result with score and reasons
 */
exports.compareCVWithJob = async (cvText, jdText) => {
  const result = await compareWithChat(jdText, cvText);
  return {
    canApply: result.canApply || false,
    score: result.score || 0,
    reasons: result.reasons || [],
    matchesThreshold: (result.score || 0) >= JOB_MATCH_SCORE_THRESHOLD,
  };
};

/**
 * Find all jobs that match a user's CV
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} Array of matching jobs with scores
 */
exports.findMatchingJobsForUser = async (userId) => {
  // Get user with CV
  const user = await User.findById(userId);
  if (!user || !user.cvExtractedText) {
    return [];
  }

  // Get all jobs with JD
  const jobs = await Job.find({ jdExtractedJson: { $exists: true } }).lean();
  if (!jobs.length) {
    return [];
  }

  const matches = [];

  for (const job of jobs) {
    const jdText = job.jdExtractedJson
      ? JSON.stringify(job.jdExtractedJson)
      : (job.descripcion || '');

    if (!jdText) continue;

    try {
      const comparison = await exports.compareCVWithJob(
        user.cvExtractedText,
        jdText
      );

      if (comparison.matchesThreshold) {
        matches.push({
          job: {
            id: job._id,
            id_simo: job.id_simo,
            codigoEmpleo: job.codigoEmpleo,
            descripcion: job.descripcion,
          },
          score: comparison.score,
          canApply: comparison.canApply,
          reasons: comparison.reasons,
        });
      }
    } catch (error) {
      console.warn(
        `Failed to compare job ${job._id} for user ${userId}:`,
        error.message
      );
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches;
};

/**
 * Compare all users with CVs against all jobs (for weekly job)
 * @returns {Promise<Object>} Statistics about matches found
 */
exports.compareAllUsersWithAllJobs = async () => {
  const users = await User.find({
    cvExtractedText: { $exists: true, $ne: '' },
  }).lean();

  const jobs = await Job.find({
    jdExtractedJson: { $exists: true },
  }).lean();

  if (!users.length || !jobs.length) {
    return {
      totalUsers: users.length,
      totalJobs: jobs.length,
      totalComparisons: 0,
      totalMatches: 0,
      userMatches: [],
    };
  }

  const userMatches = [];
  let totalComparisons = 0;
  let totalMatches = 0;

  for (const user of users) {
    let matchesForUser = 0;
    const matchDetails = [];

    for (const job of jobs) {
      const jdText = job.jdExtractedJson
        ? JSON.stringify(job.jdExtractedJson)
        : (job.descripcion || '');

      if (!jdText) continue;

      totalComparisons++;

      try {
        const comparison = await exports.compareCVWithJob(
          user.cvExtractedText,
          jdText
        );

        if (comparison.matchesThreshold) {
          matchesForUser++;
          totalMatches++;
          matchDetails.push({
            jobId: job._id,
            jobCode: job.codigoEmpleo,
            score: comparison.score,
          });
        }
      } catch (error) {
        console.warn(
          `Failed to compare job ${job._id} for user ${user._id}:`,
          error.message
        );
      }
    }

    userMatches.push({
      userId: user._id,
      userEmail: user.email,
      matches: matchesForUser,
      matchDetails,
    });
  }

  return {
    totalUsers: users.length,
    totalJobs: jobs.length,
    totalComparisons,
    totalMatches,
    userMatches,
  };
};
