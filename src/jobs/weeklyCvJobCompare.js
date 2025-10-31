/**
 * Weekly job to compare all users' CVs against all jobs
 * @module jobs/weeklyCvJobCompare
 */

const jobService = require('../services/jobService');
const {
  WEEKLY_JOB_DEFAULT_DAY,
  WEEKLY_JOB_DEFAULT_HOUR,
  WEEKLY_JOB_DEFAULT_MINUTE,
} = require('../config/constants');

/**
 * Calculate milliseconds until next scheduled run
 * @param {Object} options - Schedule options
 * @param {number} options.dayOfWeek - Day of week (0=Sunday, 1=Monday, etc.)
 * @param {number} options.hour - Hour (0-23)
 * @param {number} options.minute - Minute (0-59)
 * @returns {number} Milliseconds until next run
 */
function msUntilNextRun({ dayOfWeek = 1, hour = 3, minute = 0 } = {}) {
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(minute);
  next.setHours(hour);

  // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const currentDow = now.getDay();
  let deltaDays = (dayOfWeek - currentDow + 7) % 7;
  if (deltaDays === 0 && next <= now) {
    // Today but time already passed; schedule next week
    deltaDays = 7;
  }
  next.setDate(now.getDate() + deltaDays);
  return next - now;
}

/**
 * Run weekly comparison of all users' CVs against all jobs
 */
async function runWeeklyComparison() {
  const startedAt = new Date();
  console.log(`[weeklyCvJobCompare] Start @ ${startedAt.toISOString()}`);

  try {
    const results = await jobService.compareAllUsersWithAllJobs();

    console.log('[weeklyCvJobCompare] Results:', {
      totalUsers: results.totalUsers,
      totalJobs: results.totalJobs,
      totalComparisons: results.totalComparisons,
      totalMatches: results.totalMatches,
    });

    // Log individual user results
    results.userMatches.forEach((userMatch) => {
      console.log(
        `[weeklyCvJobCompare] User ${userMatch.userId} (${userMatch.userEmail}): ${userMatch.matches} matches`
      );

      // Future: Send email notification to user with match details
      // Future: Persist results to database for user dashboard
    });
  } catch (err) {
    console.error('[weeklyCvJobCompare] Fatal error:', err);
  } finally {
    const endedAt = new Date();
    const duration = ((endedAt - startedAt) / 1000).toFixed(2);
    console.log(`[weeklyCvJobCompare] End @ ${endedAt.toISOString()} (${duration}s)`);
  }
}

/**
 * Schedule the weekly CV/job comparison task
 * @param {Object} options - Schedule options
 * @param {number} options.dayOfWeek - Day of week (0=Sunday, 1=Monday, etc.)
 * @param {number} options.hour - Hour (0-23)
 * @param {number} options.minute - Minute (0-59)
 * @returns {Function} Cleanup function to stop the scheduler
 */
function scheduleWeeklyCvJobCompare(options = {
  dayOfWeek: WEEKLY_JOB_DEFAULT_DAY,
  hour: WEEKLY_JOB_DEFAULT_HOUR,
  minute: WEEKLY_JOB_DEFAULT_MINUTE,
}) {
  const enable = process.env.ENABLE_WEEKLY_CV_JOB_COMPARE;
  if (!enable || enable.toLowerCase() === 'false') {
    console.log('[weeklyCvJobCompare] Disabled (set ENABLE_WEEKLY_CV_JOB_COMPARE=true to enable)');
    return () => {};
  }

  let timer = null;

  const scheduleNext = () => {
    const waitMs = msUntilNextRun(options);
    const nextAt = new Date(Date.now() + waitMs);
    console.log(`[weeklyCvJobCompare] Next run scheduled @ ${nextAt.toISOString()}`);

    timer = setTimeout(async () => {
      await runWeeklyComparison();
      // After run, schedule exactly 7 days later at the same time
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      timer = setTimeout(async function tick() {
        await runWeeklyComparison();
        timer = setTimeout(tick, weekMs);
      }, weekMs);
    }, waitMs);
  };

  scheduleNext();
  return () => {
    if (timer) clearTimeout(timer);
  };
}

module.exports = { scheduleWeeklyCvJobCompare };

