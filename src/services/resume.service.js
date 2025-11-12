import prisma from "../lib/prisma.js";

export const createResume = async (user_id, resume_text, resume_fileUrl, resume_analysis, resume_analysis_score = null, resume_json = null) => {
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
