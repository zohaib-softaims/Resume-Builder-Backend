import { catchAsync, AppError } from "../utils/error.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { scrapeJobFromWeb } from "../services/jobWebScraper.service.js";
import { fetchJobFromLinkedInApi } from "../services/jobApiClient.service.js";
import { isLinkedInJobUrl, extractLinkedInJobId } from "../utils/jobUtils.js";
import { jobDescriptionPrompt } from "../llmPrompts/jobDescriptionPrompt.js";
import {
  jobGapAnalysisPrompt,
  jobGapAnalysisSchema,
} from "../llmPrompts/jobGapAnalysisPrompt.js";
import { resumeHtmlTemplate } from "../utils/resumeTemplate.js";
import { generateResumePDF } from "../utils/pdfGenerator.js";
import { s3Uploader } from "../utils/s3Uploader.js";
import { createJob, getJobById } from "../services/job.service.js";
import { getResumeById, updateResume } from "../services/resume.service.js";
import { optimizeResumeForJob } from "../services/jobResumeOptimization.service.js";
import logger from "../lib/logger.js";

export const scrapJob = catchAsync(async (req, res) => {
  const { job_url, resume_id } = req.body;

  // Fetch job description
  let jobDescription;

  if (isLinkedInJobUrl(job_url)) {
    const jobId = extractLinkedInJobId(job_url);
    if (!jobId) {
      throw new AppError(400, "Invalid LinkedIn job URL format");
    }
    jobDescription = await fetchJobFromLinkedInApi(jobId);
  } else {
    const jobText = await scrapeJobFromWeb(job_url);
    const jobDescPrompt = jobDescriptionPrompt(jobText);
    jobDescription = await getLLMResponse({
      systemPrompt: jobDescPrompt,
      messages: [],
      model: "gpt-4o-mini",
    });
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
  const parsedGapAnalysis = JSON.parse(gapAnalysis);

  // Create job record
  const job = await createJob(resume_id, job_url, jobDescription, gapAnalysis);

  return res.status(200).json({
    success: true,
    message: "Job scraped and gap analysis completed successfully",
    data: {
      job_id: job.id,
      job_description: jobDescription,
      job_gap_analysis: parsedGapAnalysis,
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

  const { job_description, job_gap_analysis, resume_id } = job;
  const parsedGapAnalysis = JSON.parse(job_gap_analysis);

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

  logger.info("Generating PDF from optimized resume", { job_id, resume_id });

  // Generate PDF from structured resume data
  const pdfBuffer = await generateResumePDF(resumeJson, resumeHtmlTemplate);

  logger.info("Uploading PDF to AWS S3", {
    job_id,
    resume_id,
    pdfSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`
  });

  // Upload PDF to AWS S3
  const mockFile = {
    buffer: pdfBuffer,
    originalname: "job-optimized-resume.pdf",
    mimetype: "application/pdf",
    size: pdfBuffer.length,
  };

  const uploadResult = await s3Uploader(mockFile);

  if (!uploadResult.success) {
    logger.error("Failed to upload PDF to AWS S3", {
      job_id,
      resume_id,
      error: uploadResult.error || "S3 upload failed",
    });
    throw new AppError(500, "Failed to upload PDF to AWS S3");
  }

  logger.info("Job-based resume optimization completed successfully", {
    job_id,
    resume_id,
    pdfUrl: uploadResult.url,
    pdfSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`
  });

  res.status(200).json({
    success: true,
    message: "Resume optimized for job and PDF generated successfully",
    data: {
      job_id,
      resume_id,
      pdf_url: uploadResult.url,
    },
  });
});
