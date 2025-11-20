import { catchAsync, AppError } from "../utils/error.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { scrapeJobWithScrapfly } from "../services/scrapeflyWebScraper.service.js";
import { fetchJobFromLinkedInApi } from "../services/jobApiClient.service.js";
import { isLinkedInJobUrl, extractLinkedInJobId } from "../utils/jobUtils.js";
import { jobDescriptionPrompt } from "../llmPrompts/jobDescriptionPrompt.js";
import {
  jobGapAnalysisPrompt,
  jobGapAnalysisSchema,
} from "../llmPrompts/jobGapAnalysisPrompt.js";
import { resumeHtmlTemplate } from "../utils/resumeTemplate.js";
import { coverLetterHtmlTemplate } from "../utils/coverLetterTemplate.js";
import {
  generateResumePDF,
  generatePDFFromHtml,
} from "../utils/pdfGenerator.js";
import { s3Uploader, deleteS3Object } from "../utils/s3Uploader.js";
import { extractOriginalFileName } from "../utils/fileUtils.js";
import {
  createJob,
  getJobById,
  updateJob,
  getJobsByUserId,
  getJobCountByUserId,
  deleteJob as deleteJobFromDb,
} from "../services/job.service.js";
import { getResumeById } from "../services/resume.service.js";
import { optimizeResumeForJob } from "../services/jobResumeOptimization.service.js";
import { generateCoverLetterForJob } from "../services/coverLetterGeneration.service.js";
import logger from "../lib/logger.js";
import { USER_LIMITS, LIMIT_ERROR_MESSAGES } from "../config/limits.config.js";
import { autoClaimGuestResume } from "../utils/autoClaimHelper.js";

export const scrapJob = catchAsync(async (req, res) => {
  // Check if user has reached the job analysis limit
  const userId = req.auth.userId;
  const jobCount = await getJobCountByUserId(userId);

  if (jobCount >= USER_LIMITS.MAX_JOBS_PER_USER) {
    throw new AppError(429, LIMIT_ERROR_MESSAGES.JOB_LIMIT_EXCEEDED);
  }

  const { job_url, job_description, resume_id } = req.body;

  // Auto-claim guest resume if applicable
  await autoClaimGuestResume(resume_id, userId);

  // Fetch or use provided job description
  let jobDescription;

  if (job_description) {
    // Use the provided job description directly
    logger.info("Using provided job description", {
      descriptionLength: job_description.length,
    });
    jobDescription = job_description;
  } else if (job_url) {
    // Scrape job from URL
    if (isLinkedInJobUrl(job_url)) {
      const jobId = extractLinkedInJobId(job_url);
      if (!jobId) {
        throw new AppError(400, "Invalid LinkedIn job URL format");
      }
      jobDescription = await fetchJobFromLinkedInApi(jobId);
    } else {
      logger.info("Scraping non-LinkedIn job with Scrapefly", { job_url });

      const jobText = await scrapeJobWithScrapfly(job_url, {
        renderJs: true,
        asp: true,
        proxyPool: "public_datacenter_pool",
      });

      if (!jobText || jobText.trim().length === 0) {
        logger.error("Failed to scrape job - empty content received", {
          job_url,
        });
        throw new AppError(500, "Failed to scrape job posting.");
      }

      logger.info("Successfully scraped job with Scrapefly", {
        job_url,
        textLength: jobText.length,
      });

      const jobDescPrompt = jobDescriptionPrompt(jobText);
      jobDescription = await getLLMResponse({
        systemPrompt: jobDescPrompt,
        messages: [],
        model: "gpt-4o-mini",
      });
    }
  } else {
    throw new AppError(400, "Either job_url or job_description must be provided");
  }

  // Fetch resume
  const resume = await getResumeById(resume_id);
  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  // Generate gap analysis
  const systemPrompt = jobGapAnalysisPrompt(resume.resume_text, jobDescription);
  const gapAnalysis = await getLLMResponse({
    systemPrompt,
    messages: [],
    model: "gpt-4o-2024-08-06",
    responseSchema: jobGapAnalysisSchema,
    schemaName: "job_gap_analysis",
  });
  const parsedGapAnalysis = gapAnalysis ? JSON.parse(gapAnalysis) : {};

  // Extract job title from gap analysis
  const jobTitle = parsedGapAnalysis.job_title || null;

  // Extract job analysis scores from gap analysis
  const jobAnalysisScore = {
    overall_match_rate: parsedGapAnalysis?.overall_match_rate || null,
    searchability_issues:
      parsedGapAnalysis?.searchability?.weak_points?.length || 0,
    formatting_issues: parsedGapAnalysis?.formatting?.bad_points?.length || 0,
    missing_skills: parsedGapAnalysis?.skills?.missing_skills?.length || 0,
    recruiter_tips_count: parsedGapAnalysis?.recruiter_tips?.length || 0,
  };

  // Remove job_title from gap analysis before storing
  const { job_title, ...gapAnalysisWithoutTitle } = parsedGapAnalysis;

  // Create job record with gap analysis excluding job_title
  const job = await createJob(
    resume_id,
    job_url || null,
    jobTitle,
    jobDescription,
    JSON.stringify(gapAnalysisWithoutTitle),
    jobAnalysisScore
  );

  return res.status(200).json({
    success: true,
    message: "Job scraped and gap analysis completed successfully",
    data: {
      job_id: job.id,
      job_title: jobTitle,
      job_description: jobDescription,
      job_gap_analysis: gapAnalysisWithoutTitle,
    },
  });
});

export const optimizeJobResume = catchAsync(async (req, res) => {
  const { job_id } = req.body;

  logger.info("Starting job-based resume optimization", { job_id });

  // Fetch job from database
  const job = await getJobById(job_id);

  if (!job) {
    throw new AppError(404, "Job not found");
  }

  // Check if resume and cover letter already exist
  if (job.optimized_resumeUrl && job.cover_letterUrl) {
    logger.info("Resume and cover letter already exist for this job", {
      job_id,
      resume_id: job.resume_id,
      pdf_url: job.optimized_resumeUrl,
      cover_letter_url: job.cover_letterUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Resume and cover letter already generated",
      data: {
        job_id,
        resume_id: job.resume_id,
        pdf_url: job.optimized_resumeUrl,
        cover_letter_url: job.cover_letterUrl,
      },
    });
  }

  const { job_description, job_gap_analysis, resume_id } = job;
  const parsedGapAnalysis = job_gap_analysis ? JSON.parse(job_gap_analysis) : {};

  // Fetch resume from database
  const resume = await getResumeById(resume_id);

  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  const { resume_text } = resume;

  logger.info("Optimizing resume content for job", { job_id, resume_id });

  // Optimize resume for job using service
  const resumeJson = await optimizeResumeForJob(
    resume_text,
    job_description,
    parsedGapAnalysis,
    job_id,
    resume_id
  );

  logger.info("Generating cover letter content", { job_id, resume_id });

  // Generate cover letter content from optimized resume
  const coverLetterJson = await generateCoverLetterForJob(
    resumeJson,
    job_description,
    job_id,
    resume_id
  );

  logger.info("Generating resume and cover letter PDFs in parallel", {
    job_id,
    resume_id,
  });

  // Generate both PDFs in parallel
  const coverLetterHtml = coverLetterHtmlTemplate(coverLetterJson, resumeJson);

  const [resumePdfBuffer, coverLetterPdfBuffer] = await Promise.all([
    generateResumePDF(resumeJson, resumeHtmlTemplate),
    generatePDFFromHtml(coverLetterHtml),
  ]);

  logger.info("Uploading resume and cover letter PDFs to AWS S3 in parallel", {
    job_id,
    resume_id,
    resumePdfSize: `${(resumePdfBuffer.length / 1024).toFixed(2)} KB`,
    coverLetterPdfSize: `${(coverLetterPdfBuffer.length / 1024).toFixed(2)} KB`,
  });

  // Upload both PDFs to AWS S3 in parallel
  const [resumeUploadResult, coverLetterUploadResult] = await Promise.all([
    s3Uploader({
      buffer: resumePdfBuffer,
      originalname: "job-optimized-resume.pdf",
      mimetype: "application/pdf",
      size: resumePdfBuffer.length,
    }),
    s3Uploader({
      buffer: coverLetterPdfBuffer,
      originalname: "job-cover-letter.pdf",
      mimetype: "application/pdf",
      size: coverLetterPdfBuffer.length,
    }),
  ]);

  if (!resumeUploadResult.success) {
    logger.error("Failed to upload resume PDF to AWS S3", {
      job_id,
      resume_id,
      error: resumeUploadResult.error || "S3 upload failed",
    });
    throw new AppError(500, "Failed to upload resume PDF to AWS S3");
  }

  if (!coverLetterUploadResult.success) {
    logger.error("Failed to upload cover letter PDF to AWS S3", {
      job_id,
      resume_id,
      error: coverLetterUploadResult.error || "S3 upload failed",
    });
    throw new AppError(500, "Failed to upload cover letter PDF to AWS S3");
  }

  // Update job record with PDF URLs and store the resume JSON
  await updateJob(job_id, resumeUploadResult.url, coverLetterUploadResult.url, resumeJson);

  logger.info(
    "Job-based resume optimization and cover letter generation completed successfully",
    {
      job_id,
      resume_id,
      resumePdfUrl: resumeUploadResult.url,
      coverLetterPdfUrl: coverLetterUploadResult.url,
      resumePdfSize: `${(resumePdfBuffer.length / 1024).toFixed(2)} KB`,
      coverLetterPdfSize: `${(coverLetterPdfBuffer.length / 1024).toFixed(
        2
      )} KB`,
    }
  );

  res.status(200).json({
    success: true,
    message: "Resume and cover letter generated successfully",
    data: {
      job_id,
      resume_id,
      pdf_url: resumeUploadResult.url,
      cover_letter_url: coverLetterUploadResult.url,
    },
  });
});

export const getJob = catchAsync(async (req, res) => {
  const { job_id } = req.params;

  logger.info("Fetching job details", { job_id });

  const job = await getJobById(job_id);

  if (!job) {
    throw new AppError(404, "Job not found");
  }

  // Parse gap analysis from JSON
  const parsedGapAnalysis = job.job_gap_analysis ? JSON.parse(job.job_gap_analysis) : {};

  return res.status(200).json({
    success: true,
    message: "Job details fetched successfully",
    data: {
      job_id: job.id,
      job_title: job.job_title,
      job_url: job.job_url,
      job_description: job.job_description,
      job_gap_analysis: parsedGapAnalysis,
      job_analysis_score: job.job_analysis_score,
      optimized_resume_url: job.optimized_resumeUrl,
      cover_letter_url: job.cover_letterUrl,
      original_resume_url: job.resume?.resume_fileUrl || null,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    },
  });
});

export const getUserJobs = catchAsync(async (req, res) => {
  const user_id = req.auth.userId;

  logger.info("Fetching user jobs", { user_id });

  const jobs = await getJobsByUserId(user_id);

  // Extract original filename from S3 URL
  const jobsData = jobs.map((job) => {
    const resumeFileUrl = job.resume?.resume_fileUrl || "";
    const originalResumeName = extractOriginalFileName(resumeFileUrl);

    return {
      job_id: job.id,
      original_resume_name: originalResumeName,
      job_title: job.job_title,
      job_analysis_score: job.job_analysis_score,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    };
  });

  return res.status(200).json({
    success: true,
    message: "User jobs fetched successfully",
    data: {
      jobs: jobsData,
      count: jobsData.length,
    },
  });
});

/**
 * Delete a job analysis, including S3 files
 * @route DELETE /api/job/:job_id
 */
export const deleteJob = catchAsync(async (req, res) => {
  const { job_id } = req.params;
  const userId = req.auth.userId;

  logger.info("Deleting job", { job_id, userId });

  // Get job to verify ownership and get file URLs
  const job = await getJobById(job_id);

  if (!job) {
    throw new AppError(404, "Job not found");
  }

  // Verify user owns this job (through resume)
  const resume = await getResumeById(job.resume_id);
  if (!resume || resume.user_id !== userId) {
    throw new AppError(403, "You don't have permission to delete this job");
  }

  // Collect all S3 URLs to delete
  const s3UrlsToDelete = [];

  if (job.optimized_resumeUrl) {
    s3UrlsToDelete.push(job.optimized_resumeUrl);
  }

  if (job.cover_letterUrl) {
    s3UrlsToDelete.push(job.cover_letterUrl);
  }

  // Delete from database
  await deleteJobFromDb(job_id);

  logger.info("Job deleted from database", { job_id });

  // Delete S3 files in background (don't await)
  Promise.all(s3UrlsToDelete.map(url => deleteS3Object(url)))
    .then(() => {
      logger.info("Background S3 cleanup completed", {
        job_id,
        filesDeleted: s3UrlsToDelete.length
      });
    })
    .catch(error => {
      logger.error("Background S3 cleanup failed", {
        job_id,
        error: error.message
      });
    });

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
    data: {
      job_id,
    },
  });
});

export const getResumeComparisonJson = catchAsync(async (req, res) => {
  const { job_id } = req.body;

  logger.info("Starting resume comparison JSON generation", { job_id });

  // Fetch job from database
  const job = await getJobById(job_id);

  if (!job) {
    throw new AppError(404, "Job not found");
  }

  const { job_description, job_gap_analysis, resume_id } = job;
  const parsedGapAnalysis = job_gap_analysis ? JSON.parse(job_gap_analysis) : {};

  // Fetch resume from database
  const resume = await getResumeById(resume_id);

  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  const { resume_text, resume_json } = resume;

  // Use resume_json field which already contains the JSON data
  const originalResumeJson = resume_json;

  logger.info("Optimizing resume content for job", { job_id, resume_id });

  // Optimize resume for job using service (same as optimizeJobResume)
  const optimizedResumeJson = await optimizeResumeForJob(
    resume_text,
    job_description,
    parsedGapAnalysis,
    job_id,
    resume_id
  );

  logger.info("Resume optimization completed, returning response immediately", {
    job_id,
    resume_id,
  });

  // Return response immediately - cover letter generation happens in background
  res.status(200).json({
    success: true,
    message: "Resume comparison data generated successfully",
    data: {
      job_id,
      resume_id,
      original_resume_json: originalResumeJson,
      optimized_resume_json: optimizedResumeJson,
    },
  });

  // Generate cover letter in background (non-blocking)
  (async () => {
    try {
      logger.info("Starting background cover letter generation", { job_id, resume_id });

      // Generate cover letter content from optimized resume
      const coverLetterJson = await generateCoverLetterForJob(
        optimizedResumeJson,
        job_description,
        job_id,
        resume_id
      );

      logger.info("Generating cover letter PDF in background", { job_id, resume_id });

      // Generate cover letter PDF
      const coverLetterHtml = coverLetterHtmlTemplate(coverLetterJson, optimizedResumeJson);
      const coverLetterPdfBuffer = await generatePDFFromHtml(coverLetterHtml);

      logger.info("Uploading cover letter PDF to AWS S3 in background", {
        job_id,
        resume_id,
        coverLetterPdfSize: `${(coverLetterPdfBuffer.length / 1024).toFixed(2)} KB`,
      });

      // Upload cover letter PDF to AWS S3
      const coverLetterUploadResult = await s3Uploader({
        buffer: coverLetterPdfBuffer,
        originalname: "job-cover-letter.pdf",
        mimetype: "application/pdf",
        size: coverLetterPdfBuffer.length,
      });

      if (!coverLetterUploadResult.success) {
        logger.error("Failed to upload cover letter PDF to AWS S3 in background", {
          job_id,
          resume_id,
          error: coverLetterUploadResult.error || "S3 upload failed",
        });
        return;
      }

      // Update job record with optimized resume JSON and cover letter URL (no resume PDF yet)
      await updateJob(job_id, null, coverLetterUploadResult.url, optimizedResumeJson);

      logger.info("Background cover letter generation completed successfully", {
        job_id,
        resume_id,
        coverLetterUrl: coverLetterUploadResult.url,
        coverLetterPdfSize: `${(coverLetterPdfBuffer.length / 1024).toFixed(2)} KB`,
      });
    } catch (error) {
      logger.error("Error in background cover letter generation", {
        job_id,
        resume_id,
        error: error.message,
        stack: error.stack,
      });
    }
  })();
});

export const generateResumeFromJson = catchAsync(async (req, res) => {
  const { job_id, resume_json } = req.body;

  logger.info("Starting resume generation from JSON", { job_id });

  // Fetch job from database
  const job = await getJobById(job_id);

  if (!job) {
    throw new AppError(404, "Job not found");
  }

  const { job_description } = job;

  logger.info("Generating resume PDF from provided JSON", {
    job_id,
    resume_id: job.resume_id,
  });

  // Generate resume PDF
  const resumePdfBuffer = await generateResumePDF(resume_json, resumeHtmlTemplate);

  // Check if cover letter exists, if not generate it
  let coverLetterUrl = job.cover_letterUrl;

  if (!coverLetterUrl) {
    logger.info("Cover letter not found, generating new cover letter", {
      job_id,
      resume_id: job.resume_id,
    });

    // Generate cover letter content from the provided resume JSON
    const coverLetterJson = await generateCoverLetterForJob(
      resume_json,
      job_description,
      job_id,
      job.resume_id
    );

    // Generate cover letter PDF
    const coverLetterHtml = coverLetterHtmlTemplate(coverLetterJson, resume_json);
    const coverLetterPdfBuffer = await generatePDFFromHtml(coverLetterHtml);

    logger.info("Uploading cover letter PDF to AWS S3", {
      job_id,
      resume_id: job.resume_id,
      coverLetterPdfSize: `${(coverLetterPdfBuffer.length / 1024).toFixed(2)} KB`,
    });

    // Upload cover letter PDF to AWS S3
    const coverLetterUploadResult = await s3Uploader({
      buffer: coverLetterPdfBuffer,
      originalname: "job-cover-letter.pdf",
      mimetype: "application/pdf",
      size: coverLetterPdfBuffer.length,
    });

    if (!coverLetterUploadResult.success) {
      logger.error("Failed to upload cover letter PDF to AWS S3", {
        job_id,
        resume_id: job.resume_id,
        error: coverLetterUploadResult.error || "S3 upload failed",
      });
      throw new AppError(500, "Failed to upload cover letter PDF to AWS S3");
    }

    coverLetterUrl = coverLetterUploadResult.url;
  }

  logger.info("Uploading resume PDF to AWS S3", {
    job_id,
    resume_id: job.resume_id,
    resumePdfSize: `${(resumePdfBuffer.length / 1024).toFixed(2)} KB`,
  });

  // Upload resume PDF to AWS S3
  const resumeUploadResult = await s3Uploader({
    buffer: resumePdfBuffer,
    originalname: "job-optimized-resume.pdf",
    mimetype: "application/pdf",
    size: resumePdfBuffer.length,
  });

  if (!resumeUploadResult.success) {
    logger.error("Failed to upload resume PDF to AWS S3", {
      job_id,
      resume_id: job.resume_id,
      error: resumeUploadResult.error || "S3 upload failed",
    });
    throw new AppError(500, "Failed to upload resume PDF to AWS S3");
  }

  // Update job record with new resume PDF URL, cover letter URL, and store the resume JSON
  await updateJob(
    job_id,
    resumeUploadResult.url,
    coverLetterUrl,
    resume_json
  );

  logger.info(
    "Resume generation from JSON completed successfully",
    {
      job_id,
      resume_id: job.resume_id,
      resumePdfUrl: resumeUploadResult.url,
      coverLetterPdfUrl: coverLetterUrl,
      resumePdfSize: `${(resumePdfBuffer.length / 1024).toFixed(2)} KB`,
    }
  );

  res.status(200).json({
    success: true,
    message: "Resume generated successfully from JSON",
    data: {
      job_id,
      resume_id: job.resume_id,
      optimized_resume_url: resumeUploadResult.url,
      cover_letter_url: coverLetterUrl,
    },
  });
});