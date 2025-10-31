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
  });
};

export const updateResume = async (resume_id, updateData) => {
  return prisma.resume.update({
    where: { id: resume_id },
    data: updateData,
  });
};

export const getResumesByUserId = async (user_id) => {
  return prisma.resume.findMany({
    where: { user_id },
    orderBy: { createdAt: "desc" },
  });
};
