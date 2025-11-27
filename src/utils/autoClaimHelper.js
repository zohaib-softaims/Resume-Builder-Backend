import { getResumeById, updateResume, getResumeCountByUserId } from "../services/resume.service.js";
import { USER_LIMITS } from "../config/limits.config.js";
import logger from "../lib/logger.js";

/**
 * Auto-claim a guest resume for an authenticated user
 * Returns a status object indicating the result
 * @param {string} resumeId - The resume ID to claim
 * @param {string} userId - The user ID claiming the resume
 * @returns {Object} Status object with { claimed: boolean, reason?: string }
 */
export async function autoClaimGuestResume(resumeId, userId) {
  if (!userId || !resumeId) return { claimed: false };

  const resume = await getResumeById(resumeId);

  // Only claim if: resume exists + no owner + not expired
  if (resume && !resume.user_id) {
    // Check if expired
    if (resume.expires_at && new Date() > new Date(resume.expires_at)) {
      return { claimed: false, reason: 'expired' };
    }

    // Check user resume limit
    const userResumeCount = await getResumeCountByUserId(userId);
    if (userResumeCount >= USER_LIMITS.MAX_RESUMES_PER_USER) {
      return { claimed: false, reason: 'limit_reached' };
    }

    // Auto-claim the resume
    await updateResume(resumeId, {
      user_id: userId,
      expires_at: null,
    });

    logger.info("Auto-claimed guest resume", { resume_id: resumeId, user_id: userId });
    return { claimed: true };
  }

  return { claimed: false };
}
