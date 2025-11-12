import { getLLMResponse } from "../lib/llmConfig.js";
import {
  resumeTextToJsonPrompt,
  resumeTextToJsonSchema,
} from "../llmPrompts/resumeTextToJsonPrompt.js";
import logger from "../lib/logger.js";

/**
 * Converts resume text to structured JSON format
 * @param {string} resumeText - The raw resume text extracted from PDF
 * @returns {Promise<object|null>} Structured resume JSON object or null if conversion fails
 */
export const convertResumeTextToJson = async (resumeText) => {
  try {
    logger.info("Starting resume text to JSON conversion");

    const systemPrompt = resumeTextToJsonPrompt(resumeText);

    const resumeJsonString = await getLLMResponse({
      systemPrompt,
      messages: [],
      model: "gpt-4o-2024-08-06",
      responseSchema: resumeTextToJsonSchema,
      schemaName: "resume_json",
    });

    if (!resumeJsonString) {
      logger.warn("LLM returned null/empty response for resume text to JSON conversion");
      return null;
    }

    const resumeJson = JSON.parse(resumeJsonString);

    logger.info("Successfully converted resume text to JSON", {
      hasName: !!resumeJson.name,
      hasEmail: !!resumeJson.email,
      skillsCount: resumeJson.skills?.length || 0,
      experienceCount: resumeJson.experience?.length || 0,
      educationCount: resumeJson.education?.length || 0,
      projectsCount: resumeJson.projects?.length || 0,
    });

    return resumeJson;
  } catch (error) {
    logger.error("Failed to convert resume text to JSON", {
      error: error.message,
      stack: error.stack,
    });
    return null;
  }
};
