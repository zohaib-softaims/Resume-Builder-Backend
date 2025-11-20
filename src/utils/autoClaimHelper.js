import { AppError } from "./error.js";
import { getResumeById, updateResume, getResumeCountByUserId } from "../services/resume.service.js";
import { USER_LIMITS, LIMIT_ERROR_MESSAGES } from "../config/limits.config.js";
import logger from "../lib/logger.js";

/**
 * Auto-claim a guest resume for an authenticated user
 * @param {string} resumeId - The resume ID to claim
 * @param {string} userId - The user ID claiming the resume
 * @throws {AppError} If resume is expired or user has reached limit
 */
export async function autoClaimGuestResume(resumeId, userId) {
  if (!userId || !resumeId) return;

  const resume = await getResumeById(resumeId);

  // Only claim if: resume exists + no owner + not expired
  if (resume && !resume.user_id) {
    // Check if expired
    if (resume.expires_at && new Date() > new Date(resume.expires_at)) {
      throw new AppError(410, "Guest resume has expired. Please upload again.");
    }

    // Check user resume limit
    const userResumeCount = await getResumeCountByUserId(userId);
    if (userResumeCount >= USER_LIMITS.MAX_RESUMES_PER_USER) {
      throw new AppError(429, LIMIT_ERROR_MESSAGES.RESUME_LIMIT_EXCEEDED);
    }

    // Auto-claim the resume
    await updateResume(resumeId, {
      user_id: userId,
      expires_at: null,
    });

    logger.info("Auto-claimed guest resume", { resume_id: resumeId, user_id: userId });
  }
}
