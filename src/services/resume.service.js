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
