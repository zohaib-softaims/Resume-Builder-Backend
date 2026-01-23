import prisma from "../lib/prisma.js";
import { AppError } from "../utils/error.js";
import { getFileNameFromUrl } from "../utils/parser.js";

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

//Admin Services
export const getJobAnalysisStats = async () => {
  const totalAnalyses = await prisma.job.count();
  
  return {
    totalAnalyses,
  };
};

export const getJobAnalysisList = async (options = {}) => {
  const { page = 1, limit = 10, search = "" } = options;

  const skip = (page - 1) * limit;

  const where = {
    resumes: {
      some: {
        jobs: {
          some: {}, 
        },
      },
    },
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        resumes: {
          select: {
            _count: {
              select: {
                jobs: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  const processedUsers = users.map((user) => {
    const totalAnalyses = user.resumes.reduce(
      (acc, resume) => acc + resume._count.jobs,
      0
    );

    return {
      userId: user.id,
      name: user.name || "N/A",
      email: user.email,
      totalAnalyses,
    };
  });

  return {
    users: processedUsers,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
    },
  };
};

export const getJobAnalysisByUserId = async (userId) => {
  const [user, totalCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        resumes: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            resume_fileUrl: true,
            jobs: {
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                job_title: true,
                job_url: true,
                job_analysis_score: true,
                optimized_resumeUrl: true,
                cover_letterUrl: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.job.count({
      where: {
        resume: {
          user_id: userId,
        },
      },
    }),
  ]);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const analyses = user.resumes.flatMap((resume) => {
    return resume.jobs.map((job) => {
      const fileName = getFileNameFromUrl(resume.resume_fileUrl);

      const score = job.job_analysis_score || {};
      const overallScore = score.overall_match_rate
        ? parseFloat(score.overall_match_rate.toString().replace("%", ""))
        : score.match_rate
        ? parseFloat(score.match_rate.toString().replace("%", ""))
        : null;

      return {
        id: job.id,
        dateCreated: job.createdAt,
        fileName: fileName,
        jobTitle: job.job_title || "N/A",
        originalResumeLink: resume.resume_fileUrl,
        jobAnalyzedResumeLink: job.optimized_resumeUrl,
        coverLetterLink: job.cover_letterUrl,
        matchRate: {
          overall: overallScore || 0,
          searchability: score.searchability_issues || { score: 0, issues: 0 },
          skills: score.missing_skills || { score: 0, missing: 0 },
          formatting: score.formatting_issues || { score: 0, issues: 0 },
          recruiterTips: score.recruiter_tips_count || { score: 0, tips: 0 },
        },
      };
    });
  });

  return {
    userId: user.id,
    name: user.name || "N/A",
    email: user.email,
    totalAnalyses: totalCount,
    analyses,
  };
};