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
import {
  getJobOptimizedSummaryPrompt,
  getJobOptimizedSkillsPrompt,
  getJobOptimizedProjectsPrompt,
  getJobOptimizedExperiencePrompt,
  getJobOptimizedAchievementsAwardsPrompt,
} from "../llmPrompts/jobOptimizationPrompts.js";
import {
  formatPersonalInfoPrompt,
  personalInfoSchema,
  formatSummaryPrompt,
  summarySchema,
  formatSkillsPrompt,
  skillsSchema,
  formatExperiencePrompt,
  experienceSchema,
  formatProjectsPrompt,
  projectsSchema,
  formatEducationPrompt,
  educationSchema,
  formatAchievementsAwardsPrompt,
  achievementsAwardsSchema,
  formatCertificationsPrompt,
  certificationsSchema,
} from "../llmPrompts/resumeSectionFormatters.js";
import { resumeHtmlTemplate } from "../utils/resumeTemplate.js";
import { generateResumePDF } from "../utils/pdfGenerator.js";
import { s3Uploader } from "../utils/s3Uploader.js";
import { createJob, getJobById } from "../services/job.service.js";
import { getResumeById, updateResume } from "../services/resume.service.js";
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

  // Fetch job from database
  const job = await getJobById(job_id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  const { job_description, job_gap_analysis, resume_id } = job;
  const parsedGapAnalysis = JSON.parse(job_gap_analysis);

  // Fetch resume from database
  const resume = await getResumeById(resume_id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: "Resume not found",
    });
  }

  const { resume_text } = resume;

  // Call multiple prompts in parallel for optimization
  const [
    optimizedSummary,
    optimizedSkills,
    optimizedProjects,
    optimizedExperience,
    optimizedAchievementsAwards,
  ] = await Promise.all([
    getLLMResponse({
      systemPrompt: getJobOptimizedSummaryPrompt(
        resume_text,
        job_description,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedSkillsPrompt(
        resume_text,
        job_description,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedProjectsPrompt(
        resume_text,
        job_description,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedExperiencePrompt(
        resume_text,
        job_description,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedAchievementsAwardsPrompt(
        resume_text,
        job_description,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
  ]);

  logger.debug(
    "Formatting each section into structured JSON for job optimization",
    { job_id, resume_id }
  );

  const [
    personalInfoJson,
    summaryJson,
    skillsJson,
    experienceJson,
    projectsJson,
    educationJson,
    achievementsAwardsJson,
    certificationsJson,
  ] = await Promise.all([
    getLLMResponse({
      systemPrompt: formatPersonalInfoPrompt(resume_text),
      messages: [],
      responseSchema: personalInfoSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "personal_info",
    }),
    getLLMResponse({
      systemPrompt: formatSummaryPrompt(optimizedSummary),
      messages: [],
      responseSchema: summarySchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "summary",
    }),
    getLLMResponse({
      systemPrompt: formatSkillsPrompt(optimizedSkills),
      messages: [],
      responseSchema: skillsSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "skills",
    }),
    getLLMResponse({
      systemPrompt: formatExperiencePrompt(optimizedExperience),
      messages: [],
      responseSchema: experienceSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "experience",
    }),
    getLLMResponse({
      systemPrompt: formatProjectsPrompt(optimizedProjects),
      messages: [],
      responseSchema: projectsSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "projects",
    }),
    getLLMResponse({
      systemPrompt: formatEducationPrompt(resume_text),
      messages: [],
      responseSchema: educationSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "education",
    }),
    getLLMResponse({
      systemPrompt: formatAchievementsAwardsPrompt(optimizedAchievementsAwards),
      messages: [],
      responseSchema: achievementsAwardsSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "achievements_awards",
    }),
    getLLMResponse({
      systemPrompt: formatCertificationsPrompt(resume_text),
      messages: [],
      responseSchema: certificationsSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "certifications",
    }),
  ]);

  // Parse all JSON responses and unwrap arrays from wrapper objects
  const personalInfo = JSON.parse(personalInfoJson);
  const summaryWrapper = JSON.parse(summaryJson);
  const skillsWrapper = JSON.parse(skillsJson);
  const experienceWrapper = JSON.parse(experienceJson);
  const projectsWrapper = JSON.parse(projectsJson);
  const educationWrapper = JSON.parse(educationJson);
  const achievementsAwardsWrapper = JSON.parse(achievementsAwardsJson);
  const certificationsWrapper = JSON.parse(certificationsJson);

  // Combine all sections into one resume JSON
  const resumeJson = {
    name: personalInfo.name || "",
    email: personalInfo.email || "",
    phone: personalInfo.phone || "",
    linkedin: personalInfo.linkedin || "",
    location: personalInfo.location || "",
    summary: (summaryWrapper.summary || "").trim(),
    skills: skillsWrapper.skills || [],
    experience: experienceWrapper.experience || [],
    education: educationWrapper.education || [],
    certifications: certificationsWrapper.certifications || [],
    projects: projectsWrapper.projects || [],
    achievements: achievementsAwardsWrapper.achievements || [],
    awards: achievementsAwardsWrapper.awards || [],
    interests: [],
  };

  // Generate HTML from the structured resume data
  logger.info("Generating HTML from resume data for job optimization", {
    job_id,
    resume_id,
  });
  const html = resumeHtmlTemplate(resumeJson);

  // Generate PDF from HTML
  logger.info("Generating PDF from HTML for job optimization", {
    job_id,
    resume_id,
  });
  const pdfBuffer = await generateResumePDF(resumeJson, resumeHtmlTemplate);

  // Upload PDF to AWS S3
  logger.info("Uploading PDF to AWS S3", {
    job_id,
    resume_id,
    fileSize: pdfBuffer.length,
  });
  const mockFile = {
    buffer: pdfBuffer,
    originalname: "job-optimized-resume.pdf",
    mimetype: "application/pdf",
    size: pdfBuffer.length,
  };

  const uploadResult = await s3Uploader(mockFile);

  if (!uploadResult.success) {
    logger.error("Failed to upload PDF to AWS S3 for job optimization", {
      job_id,
      resume_id,
      error: "S3 upload failed",
    });
    return res.status(500).json({
      success: false,
      message: "Failed to upload PDF to AWS S3",
    });
  }

  logger.info("PDF uploaded to AWS S3 successfully for job optimization", {
    job_id,
    resume_id,
    url: uploadResult.url,
  });

  // Update resume record with the optimized PDF URL
  // await updateResume(resume_id, { optimized_resumeUrl: uploadResult.url });

  logger.info(
    "Job-based resume optimization and PDF generation completed successfully",
    { job_id, resume_id, pdfUrl: uploadResult.url }
  );

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
