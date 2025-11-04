import { getLLMResponse } from "../lib/llmConfig.js";
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
import logger from "../lib/logger.js";

/**
 * Optimizes resume content based on resume analysis
 * @param {string} resumeText - The original resume text
 * @param {object} parsedAnalysis - Parsed resume analysis object
 * @param {string} resumeId - Resume ID for logging context
 * @returns {Promise<object>} Structured resume JSON object
 */
export const optimizeResume = async (resumeText, parsedAnalysis, resumeId) => {
  logger.info("Starting resume content optimization", { resume_id: resumeId });

  // Call multiple prompts in parallel for optimization
  const [
    optimizedSummary,
    optimizedSkills,
    optimizedProjects,
    optimizedExperience,
    optimizedAchievementsAwards,
  ] = await Promise.all([
    getLLMResponse({
      systemPrompt: getOptimizedSummaryPrompt(resumeText, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedSkillsPrompt(resumeText, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedProjectsPrompt(resumeText, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedExperiencePrompt(resumeText, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
    getLLMResponse({
      systemPrompt: getOptimizedAchievementsAwardsPrompt(resumeText, parsedAnalysis),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
  ]);

  logger.debug("Formatting each section into structured JSON", { resume_id: resumeId });

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

  logger.info("Resume content optimization completed", { resume_id: resumeId });

  return resumeJson;
};
