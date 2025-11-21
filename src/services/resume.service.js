import prisma from "../lib/prisma.js";

export const createResume = async (user_id, resume_text, resume_fileUrl, resume_analysis, resume_analysis_score = null, resume_json = null, expires_at = null) => {
  const data = {
    user_id,
    resume_text,
    resume_fileUrl,
    resume_analysis,
    resume_analysis_score,
  };

  // Only add resume_json if it's provided
  if (resume_json !== null) {
    data.resume_json = resume_json;
  }

  // Add expires_at for guest resumes
  if (expires_at !== null) {
    data.expires_at = expires_at;
  }

  const resume = await prisma.resume.create({
    data,
  });

  return resume;
};

export const getResumeById = async (resume_id) => {
  return prisma.resume.findUnique({
    where: { id: resume_id },
  });
};

export const updateResume = async (resume_id, updateData) => {
  return prisma.resume.update({
    where: { id: resume_id },
    data: updateData,
  });
};

export const getResumesByUserId = async (user_id, limit = null) => {
  const query = {
    where: { user_id },
    select: {
      id: true,
      user_id: true,
      resume_fileUrl: true,
      optimized_resumeUrl: true,
      resume_analysis_score: true,
      resume_json: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  };

  // Only add take if limit is provided
  if (limit) {
    query.take = limit;
  }

  return prisma.resume.findMany(query);
};

/**
 * Get the count of resumes for a specific user
 * @param {string} user_id - The user's ID
 * @returns {Promise<number>} - Count of resumes
 */
export const getResumeCountByUserId = async (user_id) => {
  return prisma.resume.count({
    where: { user_id },
  });
};

/**
 * Delete a resume and all associated jobs
 * @param {string} resume_id - The resume's ID
 * @returns {Promise<Object>} - Deleted resume with jobs
 */
export const deleteResume = async (resume_id) => {
  return prisma.resume.delete({
    where: { id: resume_id },
    include: {
      jobs: true,
    },
  });
};
