import prisma from "../lib/prisma.js";

export const createJob = async (resume_id, job_url, job_description, job_gap_analysis) => {
  const job = await prisma.job.create({
    data: {
      resume_id,
      job_url,
      job_description,
      job_gap_analysis,
    },
  });

  return job;
};
