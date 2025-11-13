import prisma from "../lib/prisma.js";

export const createJob = async (
  resume_id,
  job_url,
  job_title,
  job_description,
  job_gap_analysis,
  job_analysis_score = null
) => {
  const job = await prisma.job.create({
    data: {
      job_url,
      job_title,
      job_description,
      job_gap_analysis,
      job_analysis_score,
      resume: {
        connect: {
          id: resume_id,
        },
      },
    },
  });

  return job;
};

export const getJobById = async (job_id) => {
  return prisma.job.findUnique({
    where: { id: job_id },
    include: {
      resume: {
        select: {
          resume_fileUrl: true,
        },
      },
    },
  });
};

export const updateJob = async (
  job_id,
  optimized_resumeUrl,
  cover_letterUrl,
  optimized_resume_json = null
) => {
  const updateData = {
    optimized_resumeUrl,
    cover_letterUrl,
  };

  if (optimized_resume_json !== null) {
    updateData.optimized_resume_json = optimized_resume_json;
  }

  return prisma.job.update({
    where: { id: job_id },
    data: updateData,
  });
};

export const getJobsByUserId = async (user_id, limit = null) => {
  const query = {
    where: {
      resume: {
        user_id,
      },
    },
    select: {
      id: true,
      job_title: true,
      job_analysis_score: true,
      createdAt: true,
      updatedAt: true,
      resume: {
        select: {
          resume_fileUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  // Only add take if limit is provided
  if (limit) {
    query.take = limit;
  }

  return prisma.job.findMany(query);
};

export const getOptimizedJobCountByUserId = async (user_id) => {
  return prisma.job.count({
    where: {
      resume: { user_id },
      optimized_resumeUrl: { not: null },
    },
  });
};
