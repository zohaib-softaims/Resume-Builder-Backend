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
