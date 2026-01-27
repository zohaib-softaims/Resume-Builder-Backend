import prisma from "../lib/prisma.js";
import { AppError } from "../utils/error.js";
import { getFileNameFromUrl } from "../utils/parser.js";

export const createResume = async (user_id, resume_text, resume_fileUrl, resume_analysis, resume_analysis_score = null, resume_json = null, expires_at = null) => {
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

  // Add expires_at for guest resumes
  if (expires_at !== null) {
    data.expires_at = expires_at;
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
      resume_json: true,
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

/**
 * Get the count of resumes for a specific user
 * @param {string} user_id - The user's ID
 * @returns {Promise<number>} - Count of resumes
 */
export const getResumeCountByUserId = async (user_id) => {
  return prisma.resume.count({
    where: { user_id },
  });
};

/**
 * Delete a resume and all associated jobs
 * @param {string} resume_id - The resume's ID
 * @returns {Promise<Object>} - Deleted resume with jobs
 */
export const deleteResume = async (resume_id) => {
  return prisma.resume.delete({
    where: { id: resume_id },
    include: {
      jobs: true,
    },
  });
};

//Admin Services
export const getResumeAnalysisStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalAnalyses = await prisma.resume.count({
    where: {
      user_id: { not: null },
    },
  });

  const averageResumeAnalysisPerUser =
    totalUsers > 0
      ? (totalAnalyses / totalUsers).toFixed(2)
      : 0;

  return {
    totalAnalyses,
    averageResumeAnalysisPerUser,
  };
};

export const getResumeAnalysisList = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
  } = options;

  const skip = (page - 1) * limit;

  const where = {
    resumes: {
      some: {},
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
        _count: {
          select: {
            resumes: true,
          },
        },
        resumes: {
          where: { optimized_resumeUrl: { not: null } },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  const processedUsers = users.map((user) => ({
    userId: user.id,
    name: user.name || "N/A",
    email: user.email,
    totalAnalyses: user._count.resumes,
    optimizedGenerated: user.resumes.length,
  }));

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

export const getResumeAnalysisByUserId = async (userId) => {
  const [user, totalCount, optimizedCount] = await Promise.all([
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
            optimized_resumeUrl: true,
            resume_analysis_score: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.resume.count({
      where: { user_id: userId },
    }),
    prisma.resume.count({
      where: {
        user_id: userId,
        optimized_resumeUrl: { not: null },
      },
    }),
  ]);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const analyses = user.resumes.map((resume) => {
    const fileName = getFileNameFromUrl(resume.resume_fileUrl);

    const score = resume.resume_analysis_score || {};
    const overallScore = score.overall_resume_score
      ? parseFloat(score.overall_resume_score.toString().replace("%", ""))
      : null;
    const atsCompatibility = score.ats_compatibility
      ? parseFloat(score.ats_compatibility.toString().replace("%", ""))
      : null;
    const keywordOptimization = score.keyword_optimization
      ? parseFloat(score.keyword_optimization.toString().replace("%", ""))
      : null;
    const achievementFocus = score.achievement_focus
      ? parseFloat(score.achievement_focus.toString().replace("%", ""))
      : null;

    return {
      id: resume.id,
      dateCreated: resume.createdAt,
      fileName: fileName,
      optimizedGenerated: resume.optimized_resumeUrl !== null,
      originalLink: resume.resume_fileUrl,
      optimizedLink: resume.optimized_resumeUrl,
      overallScore: overallScore,
      atsCompatibility: atsCompatibility,
      keywordOptimization: keywordOptimization,
      achievementFocus: achievementFocus,
    };
  });

  return {
    userId: user.id,
    name: user.name || "N/A",
    email: user.email,
    totalAnalyses: totalCount,
    optimizedGenerated: optimizedCount,
    analyses,
  };
};