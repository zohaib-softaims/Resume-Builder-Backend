import prisma from "../lib/prisma.js";

export const createResume = async (userId, resumeText, fileUrl, resumeAnalysis) => {
  const resume = await prisma.resume.create({
    data: {
      userId: userId,
      resumeText: resumeText,
      resumeFileUrl: fileUrl,
      resumeAnalysis: resumeAnalysis,
    },
  });

  return resume;
};
