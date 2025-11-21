import { getResumeById, updateResume, getResumeCountByUserId } from "../services/resume.service.js";
import { USER_LIMITS } from "../config/limits.config.js";
import logger from "../lib/logger.js";

/**
 * Auto-claim a guest resume for an authenticated user
 * Silently skips if any issues occur (expired, limit reached, etc.)
 * @param {string} resumeId - The resume ID to claim
 * @param {string} userId - The user ID claiming the resume
 */
export async function autoClaimGuestResume(resumeId, userId) {
  if (!userId || !resumeId) return;

  const resume = await getResumeById(resumeId);

  // Only claim if: resume exists + no owner + not expired
  if (resume && !resume.user_id) {
    // Check if expired - silently skip
    if (resume.expires_at && new Date() > new Date(resume.expires_at)) {
      return;
    }

    // Check user resume limit - silently skip if limit reached
    const userResumeCount = await getResumeCountByUserId(userId);
    if (userResumeCount >= USER_LIMITS.MAX_RESUMES_PER_USER) {

      return;
    }

    // Auto-claim the resume
    await updateResume(resumeId, {
      user_id: userId,
      expires_at: null,
    });

    logger.info("Auto-claimed guest resume", { resume_id: resumeId, user_id: userId });
  }
}
