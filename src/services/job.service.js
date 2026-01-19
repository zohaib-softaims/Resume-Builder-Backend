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
  optimized_resume_json = null,
  is_paid = null,
  payment_mode = null
) => {
  const updateData = {
    optimized_resumeUrl,
    cover_letterUrl,
  };

  if (optimized_resume_json !== null) {
    updateData.optimized_resume_json = optimized_resume_json;
  }

  if (is_paid !== null) {
    updateData.is_paid = is_paid;
  }
  if (payment_mode !== null) {
    updateData.payment_mode = payment_mode;
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

/**
 * Get the total count of job analyses for a specific user
 * @param {string} user_id - The user's ID
 * @returns {Promise<number>} - Count of job analyses
 */
export const getJobCountByUserId = async (user_id) => {
  return prisma.job.count({
    where: {
      resume: { user_id },
    },
  });
};

export const markJobAsPaid = async (job_id, payment_mode = "one_time_payment") => {
  const job = await prisma.job.findUnique({
    where: { id: job_id },
    select: { is_paid: true, payment_mode: true },
  });

  if (!job) {
    throw new Error(`Job not found: ${job_id}`);
  }

  if (job.is_paid && job.payment_mode === payment_mode) {
    return prisma.job.findUnique({
      where: { id: job_id },
    });
  }

  return prisma.job.update({
    where: { id: job_id },
    data: { 
      is_paid: true,
      payment_mode: payment_mode,
    },
  });
};


export const markAllUserJobsAsPaid = async (userId, payment_mode = "subscription") => {
  const resumes = await prisma.resume.findMany({
    where: { user_id: userId },
    select: { id: true },
  });

  const resumeIds = resumes.map((resume) => resume.id);

  if (resumeIds.length === 0) {
    return { count: 0 };
  }

  const result = await prisma.job.updateMany({
    where: {
      resume_id: { in: resumeIds },
      is_paid: false,
    },
    data: { 
      is_paid: true,
      payment_mode: payment_mode,
    },
  });

  return result;
};

/**
 * Delete a job analysis
 * @param {string} job_id - The job's ID
 * @returns {Promise<Object>} - Deleted job
 */
export const deleteJob = async (job_id) => {
  return prisma.job.delete({
    where: { id: job_id },
  });
};
