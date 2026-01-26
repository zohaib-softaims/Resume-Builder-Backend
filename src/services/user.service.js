import { getResumesByUserId } from "./resume.service.js";
import { getJobsByUserId, getOptimizedJobCountByUserId } from "./job.service.js";
import { extractOriginalFileName } from "../utils/fileUtils.js";
import prisma from "../lib/prisma.js";

export const markConsiliariClicked = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { consiliari_clicked: true },
  });
  return user;
};

export const getUserStats = async (user_id) => {
  // Execute all 5 queries in parallel
  const [allResumes, latestResumes, allJobs, latestJobs, jobOptimizedCount] = await Promise.all([
    // Get ALL resumes for stats calculation (no limit)
    getResumesByUserId(user_id),

    // Get top 3 latest resumes (with limit)
    getResumesByUserId(user_id, 3),

    // Get ALL jobs for count (no limit)
    getJobsByUserId(user_id),

    // Get top 3 latest jobs (with limit)
    getJobsByUserId(user_id, 3),

    // Count jobs with optimized resumes
    getOptimizedJobCountByUserId(user_id),
  ]);

  // Helper function to parse score (handles "80%" or 80)
  const parseScore = (score) => {
    if (!score) return null;
    if (typeof score === "number") return score;
    if (typeof score === "string") {
      // Remove % sign and convert to number
      return parseFloat(score.replace("%", ""));
    }
    return null;
  };

  // Calculate average resume score from ALL resumes
  const resumesWithScores = allResumes
    .map((resume) => ({
      ...resume,
      parsedScore: parseScore(resume.resume_analysis_score?.overall_resume_score),
    }))
    .filter((resume) => resume.parsedScore !== null);

  const averageResumeScore =
    resumesWithScores.length > 0 ? resumesWithScores.reduce((sum, resume) => sum + resume.parsedScore, 0) / resumesWithScores.length : null;

  // Calculate best ATS score from ALL resumes
  const atsScores = allResumes.map((resume) => parseScore(resume.resume_analysis_score?.overall_resume_score)).filter((score) => score !== null);
  const bestAtsScore = atsScores.length > 0 ? Math.max(...atsScores) : null;

  return {
    overall_stats: {
      average_resume_score: averageResumeScore ? Math.round(averageResumeScore * 10) / 10 : null,
      best_ats_score: bestAtsScore,
      total_resumes_uploaded: allResumes.length,
      total_jobs_analyzed: allJobs.length,
      total_job_optimized_resumes: jobOptimizedCount,
    },
    latest_resumes: latestResumes.map((resume) => ({
      id: resume.id,
      user_id: resume.user_id,
      resume_fileUrl: resume.resume_fileUrl,
      optimized_resumeUrl: resume.optimized_resumeUrl,
      resume_analysis_score: resume.resume_analysis_score,
      original_resume_name: extractOriginalFileName(resume.resume_fileUrl),
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    })),
    latest_jobs: latestJobs.map((job) => ({
      job_id: job.id,
      original_resume_name: extractOriginalFileName(job.resume?.resume_fileUrl),
      job_title: job.job_title,
      job_analysis_score: job.job_analysis_score,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    })),
  };
};

//Admin Services
export const getUserOverviewStats = async () => {
  const totalUsers = await prisma.user.count();

  return {
    totalUsers,
  };
};

export const getUsersList = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    tab = "all",
    timeRange = "7days",
    monthFilter = "",
  } = options;

  const skip = (page - 1) * limit;

  const now = new Date();
  let dateFilter = {};

  if (monthFilter) {
    const [year, month] = monthFilter.split("-");
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    dateFilter = { gte: startDate, lte: endDate };
  } else if (timeRange) {
    let filterDate = new Date();
    if (timeRange === "yesterday") {
      filterDate.setDate(now.getDate() - 1);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter = { gte: filterDate, lt: nextDay };
    } else if (timeRange === "7days") {
      filterDate.setDate(now.getDate() - 7);
      dateFilter = { gte: filterDate };
    } else if (timeRange === "30days") {
      filterDate.setDate(now.getDate() - 30);
      dateFilter = { gte: filterDate };
    }
  }

  const where = {
    AND: [
      search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {},
      tab === "new" && Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      tab === "active" && Object.keys(dateFilter).length > 0 ? { last_login: dateFilter } : {},
    ],
  };

  try {
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          last_login: true,
          
          _count: {
            select: { resumes: true },
          },

          resumes: {
            where: { optimized_resumeUrl: { not: null } },
            select: {
              _count: {
                select: {
                  jobs: { where: { optimized_resumeUrl: { not: null } } }
                }
              }
            }
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name || "N/A",
      email: u.email,
      signupDate: u.createdAt,
      lastActivityDate: u.last_login,
      
      totalResumes: u._count.resumes,
      
      generalOptimized: u.resumes.length,

      jobOptimized: u.resumes.reduce((sum, r) => sum + r._count.jobs, 0),
    }));

    return {
      users: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch users");
  }
};