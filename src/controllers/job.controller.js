import puppeteer from "puppeteer";
import { convert } from "html-to-text";
import { catchAsync } from "../utils/error.js";
import { sanitizedText } from "../utils/sanitizedText.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { jobDescriptionPrompt } from "../llmPrompts/jobDescriptionPrompt.js";
import { jobGapAnalysisPrompt, jobGapAnalysisSchema } from "../llmPrompts/jobGapAnalysisPrompt.js";
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

export const scrapJob = catchAsync(async (req, res) => {
  const { job_url, resume_id } = req.body;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Use a real browser fingerprint to avoid being blocked
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Go to the job URL (increasing timeout)
    await page.goto(job_url, {
      waitUntil: "domcontentloaded",
      timeout: 30000, // wait up to 30s
    });

    // Get full HTML content
    const html = await page.content();

    // Convert HTML to plain text
    let jobText = convert(html, { wordwrap: false, preserveNewlines: true });
    jobText = sanitizedText(jobText);

    //  limit text to avoid token overflow
    if (jobText.length > 100000) {
      jobText = jobText.substring(0, 100000);
    }
    const jobDescPrompt = jobDescriptionPrompt(jobText);
    const jobDescription = await getLLMResponse({
      systemPrompt: jobDescPrompt,
      messages: [],
      model: "gpt-4o-mini",
    });

    // Fetch resume from database via service
    const resume = await getResumeById(resume_id);

    if (!resume) {
      if (browser) await browser.close();
      return res.status(404).json({
        success: false,
        error: "Resume not found",
      });
    }

    const resumeText = resume.resume_text;

    // Analyze job gap using LLM
    const systemPrompt = jobGapAnalysisPrompt(resumeText, jobDescription);
    const gapAnalysis = await getLLMResponse({
      systemPrompt,
      messages: [],
      model: "gpt-4o-2024-08-06",
      responseSchema: jobGapAnalysisSchema,
      schemaName: "job_gap_analysis",
    });
    const parsedGapAnalysis = JSON.parse(gapAnalysis);

    // Store in database
    const job = await createJob(resume_id, job_url, jobDescription, gapAnalysis);

    if (browser) await browser.close();
    return res.status(200).json({
      success: true,
      message: "Job scraped and gap analysis completed successfully",
      data: {
        job_id: job.id,
        job_description: jobDescription,
        job_gap_analysis: parsedGapAnalysis,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (browser) await browser.close();
  }
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
  const [optimizedSummary, optimizedSkills, optimizedProjects, optimizedExperience, optimizedAchievementsAwards] = await Promise.all([
    getLLMResponse({
      systemPrompt: getJobOptimizedSummaryPrompt(resume_text, job_description, parsedGapAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedSkillsPrompt(resume_text, job_description, parsedGapAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedProjectsPrompt(resume_text, job_description, parsedGapAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedExperiencePrompt(resume_text, job_description, parsedGapAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedAchievementsAwardsPrompt(resume_text, job_description, parsedGapAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
  ]);

  console.log("Formatting each section into structured JSON...");

  const [personalInfoJson, summaryJson, skillsJson, experienceJson, projectsJson, educationJson, achievementsAwardsJson, certificationsJson] =
    await Promise.all([
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
  console.log("Generating HTML from resume data...");
  const html = resumeHtmlTemplate(resumeJson);

  // Generate PDF from HTML
  console.log("Generating PDF from HTML...");
  const pdfBuffer = await generateResumePDF(resumeJson, resumeHtmlTemplate);

  // Upload PDF to AWS S3
  console.log("Uploading PDF to AWS S3...");
  const mockFile = {
    buffer: pdfBuffer,
    originalname: "job-optimized-resume.pdf",
    mimetype: "application/pdf",
    size: pdfBuffer.length,
  };

  const uploadResult = await s3Uploader(mockFile);

  if (!uploadResult.success) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload PDF to AWS S3",
    });
  }

  console.log("PDF uploaded to AWS S3 successfully:", uploadResult.url);

  // Update resume record with the optimized PDF URL
  // await updateResume(resume_id, { optimized_resumeUrl: uploadResult.url });

  console.log("Job-based resume optimization and PDF generation completed successfully");

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
