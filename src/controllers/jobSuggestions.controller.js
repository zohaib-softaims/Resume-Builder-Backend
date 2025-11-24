/**
 * Job Suggestions Controller
 * Handles AI-generated suggestions for resume optimization
 */

import { getLLMResponse } from "../lib/llmConfig.js";
import { generateSuggestionsPrompt } from "../llmPrompts/suggestionPrompts.js";
import { suggestionOpenAISchema } from "../schemas/suggestionSchemas.js";
import { generateCoverLetterForJob } from "../services/coverLetterGeneration.service.js";
import {
  generateResumePDF,
  generatePDFFromHtml,
} from "../utils/pdfGenerator.js";
import { resumeHtmlTemplate } from "../utils/resumeTemplate.js";
import { coverLetterHtmlTemplate } from "../utils/coverLetterTemplate.js";
import { s3Uploader } from "../utils/s3Uploader.js";
import {
  upsertSuggestions,
  getSuggestionsByJobId,
} from "../services/suggestionGenerator.service.js";
import { optimizeResumeWithSuggestions } from "../services/resumeOptimization.service.js";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import { createId as cuid } from "@paralleldrive/cuid2";

/**
 * Generate suggestions for a job
 * POST /api/job/suggest
 */
export const generateSuggestionsHandler = async (req, res) => {
  const { job_id } = req.body;

  if (!job_id) {
    return res.status(400).json({
      success: false,
      message: "job_id is required",
    });
  }

  try {
    logger.info("Starting suggestion generation", { job_id });

    // Check if suggestions already exist in the database
    const existingSuggestions = await getSuggestionsByJobId(job_id);

    if (existingSuggestions) {
      logger.info(
        "Suggestions already exist in database, returning cached version",
        {
          job_id,
        }
      );

      // Parse suggestions data
      const suggestionsData =
        typeof existingSuggestions.suggestions === "string"
          ? JSON.parse(existingSuggestions.suggestions)
          : existingSuggestions.suggestions;

      return res.status(200).json({
        success: true,
        message: "Suggestions retrieved from cache",
        data: suggestionsData,
      });
    }

    // Fetch job with resume and gap analysis
    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: {
        resume: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!job.resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found for this job",
      });
    }

    // Parse gap analysis
    const gapAnalysis =
      typeof job.job_gap_analysis === "string"
        ? JSON.parse(job.job_gap_analysis)
        : job.job_gap_analysis;

    logger.info("Calling LLM to generate suggestions", { job_id });

    // Call LLM to generate suggestions
    const responseString = await getLLMResponse({
      systemPrompt: generateSuggestionsPrompt(
        job.resume.resume_text,
        gapAnalysis,
        job.job_description
      ),
      messages: [],
      model: "gpt-4o-2024-08-06",
      responseSchema: suggestionOpenAISchema,
      schemaName: "resume_suggestions",
    });

    // Parse the JSON response
    const response = JSON.parse(responseString);

    // Add unique IDs to each suggestion
    const suggestionsWithIds = response.suggestions.map((suggestion) => ({
      id: cuid(),
      ...suggestion,
    }));

    // Calculate summary stats
    const suggestionsData = {
      suggestions: suggestionsWithIds,
      summary: {
        total_suggestions: suggestionsWithIds.length,
        estimated_match_improvement: gapAnalysis.overall_match_rate
          ? `${gapAnalysis.overall_match_rate} → Improved`
          : "N/A",
      },
    };

    logger.info("Suggestions generated successfully", {
      job_id,
      total_suggestions: suggestionsWithIds.length,
    });

    // Save to database
    await upsertSuggestions(job_id, suggestionsData);

    return res.status(200).json({
      success: true,
      message: "Suggestions generated successfully",
      data: suggestionsData,
    });
  } catch (error) {
    logger.error("Error generating suggestions", {
      job_id,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to generate suggestions",
      error: error.message,
    });
  }
};

/**
 * Get suggestions for a job
 * GET /api/job/suggest/:job_id
 */
export const getSuggestionsHandler = async (req, res) => {
  const { job_id } = req.params;

  try {
    const suggestions = await getSuggestionsByJobId(job_id);

    if (!suggestions) {
      return res.status(404).json({
        success: false,
        message: "No suggestions found for this job",
      });
    }

    return res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error("Error fetching suggestions", {
      job_id,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
      error: error.message,
    });
  }
};

/**
 * Optimize resume with accepted suggestions and generate PDFs
 * POST /api/job/optimize-with-suggestions
 */
export const optimizeWithAcceptedSuggestionsHandler = async (req, res) => {
  const { job_id, accepted_suggestion_ids } = req.body;

  try {
    logger.info("Starting resume optimization with accepted suggestions", {
      job_id,
      accepted_count: accepted_suggestion_ids?.length || 0,
    });

    // Validate accepted_suggestion_ids
    if (!accepted_suggestion_ids || accepted_suggestion_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "accepted_suggestion_ids is required and must not be empty",
      });
    }

    // Fetch job with resume
    const job = await prisma.job.findUnique({
      where: { id: job_id },
      include: {
        resume: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!job.resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found for this job",
      });
    }

    // Fetch suggestions
    const suggestionRecord = await getSuggestionsByJobId(job_id);

    if (!suggestionRecord) {
      return res.status(404).json({
        success: false,
        message: "No suggestions found for this job",
      });
    }

    // Parse suggestions data
    const suggestionsData =
      typeof suggestionRecord.suggestions === "string"
        ? JSON.parse(suggestionRecord.suggestions)
        : suggestionRecord.suggestions;

    // Filter accepted suggestions
    const acceptedSuggestions = suggestionsData.suggestions.filter((s) =>
      accepted_suggestion_ids.includes(s.id)
    );

    if (acceptedSuggestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid accepted suggestions found",
      });
    }

    logger.info("Optimizing resume with accepted suggestions", {
      job_id,
      accepted_count: acceptedSuggestions.length,
    });

    // Optimize resume with accepted suggestions
    const optimizedResumeJson = await optimizeResumeWithSuggestions(
      job.resume.resume_text,
      acceptedSuggestions,
      job_id
    );

    logger.info("Generating cover letter", { job_id });

    // Generate cover letter
    const coverLetterJson = await generateCoverLetterForJob(
      optimizedResumeJson,
      job.job_description,
      job_id,
      job.resume.id
    );

    logger.info("Generating PDFs", { job_id });

    // Generate cover letter HTML
    const coverLetterHtml = coverLetterHtmlTemplate(
      coverLetterJson,
      optimizedResumeJson
    );

    // Generate PDFs in parallel
    const [resumePDFBuffer, coverLetterPDFBuffer] = await Promise.all([
      generateResumePDF(optimizedResumeJson, resumeHtmlTemplate),
      generatePDFFromHtml(coverLetterHtml),
    ]);

    logger.info("Uploading PDFs to S3", { job_id });

    // Upload to S3 in parallel
    const [resumeUploadResult, coverLetterUploadResult] = await Promise.all([
      s3Uploader({
        buffer: resumePDFBuffer,
        originalname: "job-optimized-resume.pdf",
        mimetype: "application/pdf",
        size: resumePDFBuffer.length,
      }),
      s3Uploader({
        buffer: coverLetterPDFBuffer,
        originalname: "job-cover-letter.pdf",
        mimetype: "application/pdf",
        size: coverLetterPDFBuffer.length,
      }),
    ]);

    // Check if uploads were successful
    if (!resumeUploadResult.success || !coverLetterUploadResult.success) {
      throw new Error("Failed to upload PDFs to S3");
    }

    const resumeUrl = resumeUploadResult.url;
    const coverLetterUrl = coverLetterUploadResult.url;

    logger.info("Updating job record and saving accepted suggestions", {
      job_id,
    });

    // Update job record with URLs and optimized resume JSON
    // Also update accepted suggestions in parallel
    await Promise.all([
      prisma.job.update({
        where: { id: job_id },
        data: {
          optimized_resumeUrl: resumeUrl,
          optimized_resume_json: optimizedResumeJson,
          cover_letterUrl: coverLetterUrl,
          updatedAt: new Date(),
        },
      }),
      prisma.jobSuggestion.update({
        where: { id: suggestionRecord.id },
        data: {
          accepted_suggestion_ids: accepted_suggestion_ids,
          updatedAt: new Date(),
        },
      }),
    ]);

    logger.info("Resume optimization with suggestions completed successfully", {
      job_id,
      resume_url: resumeUrl,
      cover_letter_url: coverLetterUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Resume optimized successfully with accepted suggestions",
      data: {
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        optimized_resume_json: optimizedResumeJson,
        cover_letter_text: coverLetterJson,
      },
    });
  } catch (error) {
    logger.error("Error optimizing resume with accepted suggestions", {
      job_id: req.body.job_id,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to optimize resume with accepted suggestions",
      error: error.message,
    });
  }
};
