import { getLLMResponse } from "../lib/llmConfig.js";
import { coverLetterPrompt, coverLetterSchema } from "../llmPrompts/coverLetterPrompt.js";
import logger from "../lib/logger.js";

export const generateCoverLetterForJob = async (
  resumeJson,
  jobDescription,
  job_id,
  resume_id
) => {
  logger.info("Starting cover letter generation", { job_id, resume_id });

  try {
    // Generate cover letter using LLM
    const systemPrompt = coverLetterPrompt(resumeJson, jobDescription);

    const coverLetterResponse = await getLLMResponse({
      systemPrompt,
      messages: [],
      model: "gpt-4o-2024-08-06",
      responseSchema: coverLetterSchema,
      schemaName: "cover_letter",
    });

    const coverLetterJson = coverLetterResponse ? JSON.parse(coverLetterResponse) : {};

    logger.info("Cover letter generated successfully", {
      job_id,
      resume_id,
      paragraphs_count: coverLetterJson.body_paragraphs?.length || 0,
    });

    return coverLetterJson;
  } catch (error) {
    logger.error("Failed to generate cover letter", {
      job_id,
      resume_id,
      error: error.message,
    });
    throw error;
  }
};
