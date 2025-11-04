import { catchAsync } from "../utils/error.js";
import pdfParse from "pdf-parse";
import { sanitizedText } from "../utils/sanitizedText.js";
import { resumeAnalysisPrompt, resumeAnalysisSchema } from "../llmPrompts/resumeAnalysisPrompt.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { s3Uploader } from "../utils/s3Uploader.js";
import { createResume, getResumeById, updateResume, getResumesByUserId } from "../services/resume.service.js";
import logger from "../lib/logger.js";
import {
  getOptimizedSummaryPrompt,
  getOptimizedSkillsPrompt,
  getOptimizedProjectsPrompt,
  getOptimizedExperiencePrompt,
  getOptimizedAchievementsAwardsPrompt,
} from "../llmPrompts/resumeOptimizationPrompts.js";
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

export const parseResume = catchAsync(async (req, res) => {
  const dataBuffer = req.file.buffer;

  const parsed = await pdfParse(dataBuffer);
  let resumeText = parsed.text;
  resumeText = sanitizedText(resumeText);

  const systemPrompt = resumeAnalysisPrompt(resumeText);
  let analysis = await getLLMResponse({
    systemPrompt,
    messages: [],
    responseSchema: resumeAnalysisSchema,
    schemaName: "resume_analysis",
  });

  // The response is guaranteed to be valid JSON matching the schema
  const parsedAnalysis = JSON.parse(analysis);

  // Extract score fields from analysis
  const resumeAnalysisScore = {
    overall_resume_score: parsedAnalysis?.overall_resume_score || null,
    ats_compatibility: parsedAnalysis?.ats_compatibility || null,
    keyword_optimization: parsedAnalysis?.keyword_optimization || null,
    achievement_focus: parsedAnalysis?.achievement_focus || null,
  };

  const uploadResult = await s3Uploader(req.file);
  const uploadedResumeUrl = uploadResult.success ? uploadResult.url : null;
  const response = await createResume(req.auth.userId, resumeText, uploadedResumeUrl, analysis, resumeAnalysisScore);

  res.status(200).json({
    success: true,
    message: "Resume analyzed successfully",
    data: {
      resume_id: response.id,
      resume_analysis: parsedAnalysis,
    },
  });
});

export const optimizeResume = catchAsync(async (req, res) => {
  const { resume_id } = req.body;
  const resume = await getResumeById(resume_id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: "Resume not found",
    });
  }
  if (resume) {
    return res.status(200).json({
      success: true,
      message: "Resume optimized and PDF generated successfully",
      data: {
        resume_id,
        pdf_url: resume.optimized_resumeUrl,
      },
    });
  }

  const { resume_text, resume_analysis } = resume;
  const parsedAnalysis = JSON.parse(resume_analysis);

  // Call multiple prompts in parallel for optimization (no certifications optimization)
  const [optimizedSummary, optimizedSkills, optimizedProjects, optimizedExperience, optimizedAchievementsAwards] = await Promise.all([
    getLLMResponse({
      systemPrompt: getOptimizedSummaryPrompt(resume_text, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedSkillsPrompt(resume_text, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedProjectsPrompt(resume_text, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedExperiencePrompt(resume_text, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedAchievementsAwardsPrompt(resume_text, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
  ]);

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

  logger.debug("Formatting each section into structured JSON", { projectsCount: projectsWrapper.projects?.length || 0 });
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
  logger.info("Generating HTML from resume data", { resume_id });
  const html = resumeHtmlTemplate(resumeJson);

  // Generate PDF from HTML
  logger.info("Generating PDF from HTML", { resume_id });
  const pdfBuffer = await generateResumePDF(resumeJson, resumeHtmlTemplate);

  // Upload PDF to AWS S3
  logger.info("Uploading PDF to AWS S3", { resume_id, fileSize: pdfBuffer.length });
  const mockFile = {
    buffer: pdfBuffer,
    originalname: "optimized-resume.pdf",
    mimetype: "application/pdf",
    size: pdfBuffer.length,
  };

  const uploadResult = await s3Uploader(mockFile);

  if (!uploadResult.success) {
    logger.error("Failed to upload PDF to AWS S3", { resume_id, error: "S3 upload failed" });
    return res.status(500).json({
      success: false,
      message: "Failed to upload PDF to AWS S3",
    });
  }

  logger.info("PDF uploaded to AWS S3 successfully", { resume_id, url: uploadResult.url });

  // Update resume record with the optimized PDF URL
  await updateResume(resume_id, { optimized_resumeUrl: uploadResult.url });

  logger.info("Resume optimization and PDF generation completed successfully", { resume_id, pdfUrl: uploadResult.url });

  res.status(200).json({
    success: true,
    message: "Resume optimized and PDF generated successfully",
    data: {
      resume_id,
      pdf_url: uploadResult.url,
    },
  });
});

export const getUserResumes = catchAsync(async (req, res) => {
  const user_id = req.auth.userId;

  const resumes = await getResumesByUserId(user_id);

  res.status(200).json({
    success: true,
    message: "Resumes fetched successfully",
    data: {
      resumes,
      count: resumes.length,
    },
  });
});
