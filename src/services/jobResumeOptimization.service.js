import { getLLMResponse } from "../lib/llmConfig.js";
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
import logger from "../lib/logger.js";

/**
 * Optimizes resume content based on job description and gap analysis
 * @param {string} resumeText - The original resume text
 * @param {string} jobDescription - The job description to optimize for
 * @param {object} parsedGapAnalysis - Parsed gap analysis object
 * @param {string} jobId - Job ID for logging context
 * @param {string} resumeId - Resume ID for logging context
 * @returns {Promise<object>} Structured resume JSON object
 */

export const optimizeResumeForJob = async (
  resumeText,
  jobDescription,
  parsedGapAnalysis,
  jobId,
  resumeId
) => {
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
        resumeText,
        jobDescription,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedSkillsPrompt(
        resumeText,
        jobDescription,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedProjectsPrompt(
        resumeText,
        jobDescription,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedExperiencePrompt(
        resumeText,
        jobDescription,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getJobOptimizedAchievementsAwardsPrompt(
        resumeText,
        jobDescription,
        parsedGapAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
  ]);

  logger.debug(
    "Formatting each section into structured JSON for job optimization",
    { job_id: jobId, resume_id: resumeId }
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
      systemPrompt: formatPersonalInfoPrompt(resumeText),
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
      systemPrompt: formatEducationPrompt(resumeText),
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
      systemPrompt: formatCertificationsPrompt(resumeText),
      messages: [],
      responseSchema: certificationsSchema,
      model: "gpt-4o-2024-08-06",
      schemaName: "certifications",
    }),
  ]);

  // Parse all JSON responses and unwrap arrays from wrapper objects
  // Add null checks to prevent parsing errors when LLM returns null
  const personalInfo = personalInfoJson ? JSON.parse(personalInfoJson) : {};
  const summaryWrapper = summaryJson ? JSON.parse(summaryJson) : {};
  const skillsWrapper = skillsJson ? JSON.parse(skillsJson) : {};
  const experienceWrapper = experienceJson ? JSON.parse(experienceJson) : {};
  const projectsWrapper = projectsJson ? JSON.parse(projectsJson) : {};
  const educationWrapper = educationJson ? JSON.parse(educationJson) : {};
  const achievementsAwardsWrapper = achievementsAwardsJson ? JSON.parse(achievementsAwardsJson) : {};
  const certificationsWrapper = certificationsJson ? JSON.parse(certificationsJson) : {};

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

  return resumeJson;
};
