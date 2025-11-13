/**
 * Suggestion Generator Service
 * Handles database operations for job suggestions
 */

import prisma from "../lib/prisma.js";

/**
 * Create new suggestions for a job
 * @param {string} job_id - Job ID
 * @param {object} suggestions - Suggestions data object
 * @param {Array<string>} accepted_suggestion_ids - Optional array of accepted suggestion IDs
 * @returns {Promise<object>} Created JobSuggestion record
 */
export const createSuggestions = async (
  job_id,
  suggestions,
  accepted_suggestion_ids = null
) => {
  const data = {
    job_id,
    suggestions,
  };

  // Only add accepted_suggestion_ids if provided
  if (accepted_suggestion_ids !== null) {
    data.accepted_suggestion_ids = accepted_suggestion_ids;
  }

  const jobSuggestion = await prisma.jobSuggestion.create({
    data,
  });

  return jobSuggestion;
};

/**
 * Get suggestions by job ID
 * @param {string} job_id - Job ID
 * @returns {Promise<object|null>} JobSuggestion record or null
 */
export const getSuggestionsByJobId = async (job_id) => {
  return prisma.jobSuggestion.findFirst({
    where: { job_id },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Update suggestions
 * @param {string} id - JobSuggestion ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Updated JobSuggestion record
 */
export const updateSuggestions = async (id, updateData) => {
  return prisma.jobSuggestion.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Update or create suggestions for a job
 * @param {string} job_id - Job ID
 * @param {object} suggestions - Suggestions data object
 * @param {Array<string>} accepted_suggestion_ids - Optional array of accepted suggestion IDs
 * @returns {Promise<object>} Created or updated JobSuggestion record
 */
export const upsertSuggestions = async (
  job_id,
  suggestions,
  accepted_suggestion_ids = null
) => {
  const existing = await getSuggestionsByJobId(job_id);

  if (existing) {
    const updateData = { suggestions };
    if (accepted_suggestion_ids !== null) {
      updateData.accepted_suggestion_ids = accepted_suggestion_ids;
    }
    return updateSuggestions(existing.id, updateData);
  }

  return createSuggestions(job_id, suggestions, accepted_suggestion_ids);
};

/**
 * Delete suggestions by job ID
 * @param {string} job_id - Job ID
 * @returns {Promise<object>} Delete result
 */
export const deleteSuggestionsByJobId = async (job_id) => {
  return prisma.jobSuggestion.deleteMany({
    where: { job_id },
  });
};

/**
 * Get all suggestions for a job with job details
 * @param {string} job_id - Job ID
 * @returns {Promise<object|null>} JobSuggestion with job relation or null
 */
export const getSuggestionsWithJob = async (job_id) => {
  return prisma.jobSuggestion.findFirst({
    where: { job_id },
    include: {
      job: {
        include: {
          resume: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
