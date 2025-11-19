/**
 * User limits configuration
 *
 * This file contains configurable limits for user actions.
 * You can easily modify these values to change the limits for all users.
 */

export const USER_LIMITS = {
  /**
   * Maximum number of resumes a user can upload
   * @type {number}
   */
  MAX_RESUMES_PER_USER: 8,

  /**
   * Maximum number of job analyses a user can perform
   * @type {number}
   */
  MAX_JOBS_PER_USER: 8,

  /**
   * Maximum file size for resume uploads (in bytes)
   * Default: 5MB
   * @type {number}
   */
  MAX_FILE_SIZE: 5 * 1024 * 1024,

  /**
   * Maximum character length for job descriptions
   * @type {number}
   */
  MAX_JOB_DESCRIPTION_LENGTH: 50000,
};

/**
 * Error messages for limit violations
 */
export const LIMIT_ERROR_MESSAGES = {
  RESUME_LIMIT_EXCEEDED: `You have reached the maximum limit of ${USER_LIMITS.MAX_RESUMES_PER_USER} resumes. Please delete an existing resume to upload a new one.`,
  JOB_LIMIT_EXCEEDED: `You have reached the maximum limit of ${USER_LIMITS.MAX_JOBS_PER_USER} job analyses. Please delete an existing job analysis to create a new one.`,
  FILE_SIZE_EXCEEDED: `File size exceeds the maximum limit of ${
    USER_LIMITS.MAX_FILE_SIZE / (1024 * 1024)
  }MB.`,
  JOB_DESCRIPTION_TOO_LONG: `Job description exceeds the maximum length of ${USER_LIMITS.MAX_JOB_DESCRIPTION_LENGTH} characters.`,
};
