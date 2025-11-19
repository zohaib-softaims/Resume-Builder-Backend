import { getResumesByUserId } from "./resume.service.js";
import { getJobsByUserId, getOptimizedJobCountByUserId } from "./job.service.js";
import { extractOriginalFileName } from "../utils/fileUtils.js";

export const getUserStats = async (user_id) => {
  // Execute all 5 queries in parallel
  const [allResumes, latestResumes, allJobs, latestJobs, jobOptimizedCount] =
    await Promise.all([
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
      parsedScore: parseScore(
        resume.resume_analysis_score?.overall_resume_score
      ),
    }))
    .filter((resume) => resume.parsedScore !== null);

  const averageResumeScore =
    resumesWithScores.length > 0
      ? resumesWithScores.reduce((sum, resume) => sum + resume.parsedScore, 0) /
        resumesWithScores.length
      : null;

  // Calculate best ATS score from ALL resumes
  const atsScores = allResumes
    .map((resume) =>
      parseScore(resume.resume_analysis_score?.ats_compatibility)
    )
    .filter((score) => score !== null);
  const bestAtsScore = atsScores.length > 0 ? Math.max(...atsScores) : null;

  return {
    overall_stats: {
      average_resume_score: averageResumeScore
        ? Math.round(averageResumeScore * 10) / 10
        : null,
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
      original_resume_name: extractOriginalFileName(
        job.resume?.resume_fileUrl
      ),
      job_title: job.job_title,
      job_analysis_score: job.job_analysis_score,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    })),
  };
};
