import { catchAsync } from "../utils/error.js";
import { USER_LIMITS } from "../config/limits.config.js";
import { getResumeCountByUserId } from "../services/resume.service.js";
import { getJobCountByUserId } from "../services/job.service.js";

/**
 * Get user limits and current usage
 * @route GET /api/limits
 */
export const getUserLimits = catchAsync(async (req, res) => {
  const userId = req.auth.userId;

  // Get current counts
  const [resumeCount, jobCount] = await Promise.all([
    getResumeCountByUserId(userId),
    getJobCountByUserId(userId),
  ]);

  res.status(200).json({
    success: true,
    data: {
      limits: {
        maxResumes: USER_LIMITS.MAX_RESUMES_PER_USER,
        maxJobs: USER_LIMITS.MAX_JOBS_PER_USER,
        maxFileSize: USER_LIMITS.MAX_FILE_SIZE,
        maxJobDescriptionLength: USER_LIMITS.MAX_JOB_DESCRIPTION_LENGTH,
      },
      usage: {
        resumeCount,
        jobCount,
      },
      remaining: {
        resumes: USER_LIMITS.MAX_RESUMES_PER_USER - resumeCount,
        jobs: USER_LIMITS.MAX_JOBS_PER_USER - jobCount,
      },
    },
  });
});
