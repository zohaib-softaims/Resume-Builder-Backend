import prisma from "../lib/prisma.js";

export const createResume = async (user_id, resume_text, resume_fileUrl, resume_analysis) => {
  const resume = await prisma.resume.create({
    data: {
      user_id,
      resume_text,
      resume_fileUrl,
      resume_analysis,
    },
  });

  return resume;
};

export const getResumeById = async (resume_id) => {
  return prisma.resume.findUnique({
    where: { id: resume_id },
    select: {
      id: true,
      resume_text: true,
    },
  });
};

export const getResumeWithAnalysis = async (resume_id, user_id) => {
  return prisma.resume.findFirst({
    where: {
      id: resume_id,
      user_id: user_id,
    },
    select: {
      id: true,
      resume_text: true,
      resume_analysis: true,
    },
  });
};

export const updateOptimizedResumeUrl = async (resume_id, optimized_resumeUrl) => {
  return prisma.resume.update({
    where: { id: resume_id },
    data: { optimized_resumeUrl },
    select: {
      id: true,
      optimized_resumeUrl: true,
    },
  });
};
