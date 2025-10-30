import { catchAsync } from "../utils/error.js";
import pdfParse from "pdf-parse";
import { sanitizedText } from "../utils/sanitizedText.js";
import { resumeAnalysisPrompt, resumeAnalysisSchema } from "../llmPrompts/resumeAnalysisPrompt.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { s3Uploader } from "../utils/s3Uploader.js";
import { createResume, getResumeWithAnalysis, updateOptimizedResumeUrl } from "../services/resume.service.js";
import {
  getOptimizedSummaryPrompt,
  getOptimizedSkillsPrompt,
  getOptimizedProjectsPrompt,
  getOptimizedExperiencePrompt,
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
  const uploadResult = await s3Uploader(req.file);
  const uploadedResumeUrl = uploadResult.success ? uploadResult.url : null;
  const response = await createResume(req.auth.userId, resumeText, uploadedResumeUrl, analysis);

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
  const user_id = "user_34jYMUY6A4AWtscZ510Uxdd2QLs";

  // Fetch resume with analysis from database
  const resume = await getResumeWithAnalysis(resume_id, user_id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: "Resume not found",
    });
  }

  const { resume_text, resume_analysis } = resume;
  const parsedAnalysis = JSON.parse(resume_analysis);

  // Call multiple prompts in parallel for optimization
  const [optimizedSummary, optimizedSkills, optimizedProjects, optimizedExperience] = await Promise.all([
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
  ]);

  console.log("Formatting each section into structured JSON...", optimizedProjects);

  const [personalInfoJson, summaryJson, skillsJson, experienceJson, projectsJson, educationJson] = await Promise.all([
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
  ]);

  // Parse all JSON responses and unwrap arrays from wrapper objects
  const personalInfo = JSON.parse(personalInfoJson);
  const summaryWrapper = JSON.parse(summaryJson);
  const skillsWrapper = JSON.parse(skillsJson);
  const experienceWrapper = JSON.parse(experienceJson);
  const projectsWrapper = JSON.parse(projectsJson);
  const educationWrapper = JSON.parse(educationJson);

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
    certifications: [],
    projects: projectsWrapper.projects || [],
    achievements: [],
    awards: [],
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
    originalname: "optimized-resume.pdf",
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
  await updateOptimizedResumeUrl(resume_id, uploadResult.url);

  console.log("Resume optimization and PDF generation completed successfully");

  res.status(200).json({
    success: true,
    message: "Resume optimized and PDF generated successfully",
    data: {
      resume_id,
      pdf_url: uploadResult.url,
    },
  });
});
