import { getLLMResponse } from "../lib/llmConfig.js";
import {
  getOptimizedSummaryPrompt,
  getOptimizedSkillsPrompt,
  getOptimizedProjectsPrompt,
  getOptimizedExperiencePrompt,
  getOptimizedAchievementsAwardsPrompt,
} from "../llmPrompts/resumeOptimizationPrompts.js";
import {
  getOptimizedSummaryWithSuggestionsPrompt,
  getOptimizedSkillsWithSuggestionsPrompt,
  getOptimizedExperienceWithSuggestionsPrompt,
  getOptimizedProjectsWithSuggestionsPrompt,
  getOptimizedAchievementsWithSuggestionsPrompt,
  getOptimizedEducationWithSuggestionsPrompt,
  getOptimizedCertificationsWithSuggestionsPrompt,
} from "../llmPrompts/suggestionOptimizationPrompts.js";
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
      systemPrompt: getOptimizedAchievementsAwardsPrompt(
        resumeText,
        parsedAnalysis
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
    }),
  ]);

  logger.debug("Formatting each section into structured JSON", {
    resume_id: resumeId,
  });

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

  logger.info("Resume content optimization completed", { resume_id: resumeId });

  return resumeJson;
};

/**
 * Optimizes resume with accepted suggestions
 * @param {string} resumeText - The original resume text
 * @param {Array} acceptedSuggestions - Array of accepted suggestion objects
 * @param {string} jobId - Job ID for logging context
 * @returns {Promise<object>} Structured resume JSON object
 */
export const optimizeResumeWithSuggestions = async (
  resumeText,
  acceptedSuggestions,
  jobId
) => {
  logger.info("Starting resume optimization with suggestions", {
    job_id: jobId,
    total_suggestions: acceptedSuggestions.length,
  });

  // Group suggestions by section
  const suggestionsBySection = {
    summary: acceptedSuggestions.filter((s) => s.section === "summary"),
    skills: acceptedSuggestions.filter((s) => s.section === "skills"),
    experience: acceptedSuggestions.filter((s) => s.section === "experience"),
    projects: acceptedSuggestions.filter((s) => s.section === "projects"),
    achievements: acceptedSuggestions.filter((s) => s.section === "achievements"),
    education: acceptedSuggestions.filter((s) => s.section === "education"),
    certifications: acceptedSuggestions.filter((s) => s.section === "certifications"),
  };

  logger.info("Suggestions grouped by section", {
    job_id: jobId,
    summary: suggestionsBySection.summary.length,
    skills: suggestionsBySection.skills.length,
    experience: suggestionsBySection.experience.length,
    projects: suggestionsBySection.projects.length,
    achievements: suggestionsBySection.achievements.length,
    education: suggestionsBySection.education.length,
    certifications: suggestionsBySection.certifications.length,
  });

  // Section configuration: maps section name to optimization prompt function
  const sectionConfig = [
    { name: "summary", promptFn: getOptimizedSummaryWithSuggestionsPrompt },
    { name: "skills", promptFn: getOptimizedSkillsWithSuggestionsPrompt },
    { name: "experience", promptFn: getOptimizedExperienceWithSuggestionsPrompt },
    { name: "projects", promptFn: getOptimizedProjectsWithSuggestionsPrompt },
    { name: "achievements", promptFn: getOptimizedAchievementsWithSuggestionsPrompt },
    { name: "education", promptFn: getOptimizedEducationWithSuggestionsPrompt },
    { name: "certifications", promptFn: getOptimizedCertificationsWithSuggestionsPrompt },
  ];

  // Prepare optimization calls dynamically
  const optimizationCalls = sectionConfig.map(({ name, promptFn }) => {
    const suggestions = suggestionsBySection[name];
    if (suggestions.length > 0) {
      return getLLMResponse({
        systemPrompt: promptFn(
          resumeText,
          suggestions[0].target.current,
          suggestions
        ),
        messages: [],
        model: "gpt-4o-2024-08-06",
      });
    }
    return Promise.resolve(null);
  });

  logger.info("Calling LLM for sections with suggestions", { job_id: jobId });

  const optimizedSections = await Promise.all(optimizationCalls);

  // Map results back to named variables for clarity
  const [
    optimizedSummary,
    optimizedSkills,
    optimizedExperience,
    optimizedProjects,
    optimizedAchievementsAwards,
    optimizedEducation,
    optimizedCertifications,
  ] = optimizedSections;

  logger.debug("Formatting sections into structured JSON", { job_id: jobId });

  // Helper function to format sections
  const formatSection = (optimizedText, formatPromptFn, schema, schemaName) => {
    const sourceText = optimizedText || resumeText;
    return getLLMResponse({
      systemPrompt: formatPromptFn(sourceText),
      messages: [],
      responseSchema: schema,
      model: "gpt-4o-2024-08-06",
      schemaName,
    });
  };

  // Format all sections in parallel
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
    formatSection(null, formatPersonalInfoPrompt, personalInfoSchema, "personal_info"),
    formatSection(optimizedSummary, formatSummaryPrompt, summarySchema, "summary"),
    formatSection(optimizedSkills, formatSkillsPrompt, skillsSchema, "skills"),
    formatSection(optimizedExperience, formatExperiencePrompt, experienceSchema, "experience"),
    formatSection(optimizedProjects, formatProjectsPrompt, projectsSchema, "projects"),
    formatSection(optimizedEducation, formatEducationPrompt, educationSchema, "education"),
    formatSection(optimizedAchievementsAwards, formatAchievementsAwardsPrompt, achievementsAwardsSchema, "achievements_awards"),
    formatSection(optimizedCertifications, formatCertificationsPrompt, certificationsSchema, "certifications"),
  ]);

  // Parse all JSON responses
  const personalInfo = personalInfoJson ? JSON.parse(personalInfoJson) : {};
  const summaryWrapper = summaryJson ? JSON.parse(summaryJson) : {};
  const skillsWrapper = skillsJson ? JSON.parse(skillsJson) : {};
  const experienceWrapper = experienceJson ? JSON.parse(experienceJson) : {};
  const projectsWrapper = projectsJson ? JSON.parse(projectsJson) : {};
  const educationWrapper = educationJson ? JSON.parse(educationJson) : {};
  const achievementsAwardsWrapper = achievementsAwardsJson
    ? JSON.parse(achievementsAwardsJson)
    : {};
  const certificationsWrapper = certificationsJson
    ? JSON.parse(certificationsJson)
    : {};

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

  logger.info("Resume optimization with suggestions completed", {
    job_id: jobId,
  });

  return resumeJson;
};
