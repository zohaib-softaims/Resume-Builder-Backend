import { catchAsync, AppError } from "../utils/error.js";
import pdfParse from "pdf-parse";
import { sanitizedText } from "../utils/sanitizedText.js";
import {
  resumeAnalysisPrompt,
  resumeAnalysisSchema,
} from "../llmPrompts/resumeAnalysisPrompt.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { s3Uploader } from "../utils/s3Uploader.js";
import {
  createResume,
  getResumeById,
  updateResume,
  getResumesByUserId,
} from "../services/resume.service.js";
import { optimizeResume as optimizeResumeContent } from "../services/resumeOptimization.service.js";
import { convertResumeTextToJson } from "../services/resumeTextToJson.service.js";
import { convertJsonToResumeText } from "../utils/jsonToResumeText.js";
import logger from "../lib/logger.js";
import { resumeHtmlTemplate } from "../utils/resumeTemplate.js";
import { generateResumePDF } from "../utils/pdfGenerator.js";
import { extractOriginalFileName } from "../utils/fileUtils.js";

export const parseResume = catchAsync(async (req, res) => {
  let resumeText = '';
  let uploadedResumeUrl = null;
  let resumeJson = null;

  // Handle JSON resume data (from form)
  if (req.isJsonResume) {
    logger.info("Processing JSON resume data from form");

    // Store the JSON data directly
    resumeJson = req.body;

    // Convert JSON to text for LLM analysis
    resumeText = convertJsonToResumeText(resumeJson);
    resumeText = sanitizedText(resumeText);

    logger.info("Generating PDF from JSON resume data");

    // Generate PDF from JSON data (like optimize does)
    const pdfBuffer = await generateResumePDF(resumeJson, resumeHtmlTemplate);

    // Upload PDF to S3
    const mockFile = {
      buffer: pdfBuffer,
      originalname: `${resumeJson.name || 'resume'}-form-created.pdf`,
      mimetype: "application/pdf",
      size: pdfBuffer.length,
    };

    const uploadResult = await s3Uploader(mockFile);

    if (!uploadResult.success) {
      logger.error("Failed to upload generated PDF to S3");
      throw new AppError(500, "Failed to upload PDF to S3");
    }

    uploadedResumeUrl = uploadResult.url;
    logger.info("PDF generated and uploaded successfully", { url: uploadedResumeUrl });

  }
  // Handle file upload (PDF/DOCX)
  else if (req.isFileUpload) {
    logger.info("Processing uploaded resume file");

    const dataBuffer = req.file.buffer;
    const parsed = await pdfParse(dataBuffer);
    resumeText = parsed.text;
    resumeText = sanitizedText(resumeText);

    // Upload original file to S3
    const uploadResult = await s3Uploader(req.file);
    uploadedResumeUrl = uploadResult.success ? uploadResult.url : null;
  }

  // Analyze resume text using LLM (same for both file and JSON)
  logger.info("Analyzing resume with LLM");
  const systemPrompt = resumeAnalysisPrompt(resumeText);
  let analysis = await getLLMResponse({
    systemPrompt,
    messages: [],
    responseSchema: resumeAnalysisSchema,
    schemaName: "resume_analysis",
  });

  // The response is guaranteed to be valid JSON matching the schema
  const parsedAnalysis = analysis ? JSON.parse(analysis) : {};

  // Extract score fields from analysis
  const resumeAnalysisScore = {
    overall_resume_score: parsedAnalysis?.overall_resume_score || null,
    ats_compatibility: parsedAnalysis?.ats_compatibility || null,
    keyword_optimization: parsedAnalysis?.keyword_optimization || null,
    achievement_focus: parsedAnalysis?.achievement_focus || null,
  };

  // Create resume record in database
  const response = await createResume(
    req.auth.userId,
    resumeText,
    uploadedResumeUrl,
    analysis,
    resumeAnalysisScore,
    resumeJson // Pass JSON data if available (will be null for file uploads)
  );

  const resumeId = response.id;

  // If file was uploaded, convert to JSON in background
  if (req.isFileUpload) {
    convertResumeTextToJson(resumeText)
      .then((convertedJson) => {
        if (convertedJson) {
          logger.info("Background JSON conversion completed successfully", {
            resume_id: resumeId,
          });
          return updateResume(resumeId, { resume_json: convertedJson });
        } else {
          logger.warn("Background JSON conversion returned null", {
            resume_id: resumeId,
          });
        }
      })
      .catch((error) => {
        logger.error("Background JSON conversion failed", {
          resume_id: resumeId,
          error: error.message,
        });
      });
  }

  logger.info("Resume processed successfully", { resume_id: resumeId });

  res.status(200).json({
    success: true,
    message: "Resume analyzed successfully",
    data: {
      resume_id: response.id,
      resume_analysis: parsedAnalysis,
      resume_url: uploadedResumeUrl,
    },
  });
});

export const optimizeResume = catchAsync(async (req, res) => {
  const { resume_id } = req.body;

  logger.info("Starting resume optimization", { resume_id });

  // Fetch resume from database
  const resume = await getResumeById(resume_id);

  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  if (resume.optimized_resumeUrl) {
    return res.status(200).json({
      success: true,
      message: "Resume already optimized",
      data: {
        resume_id,
        pdf_url: resume.optimized_resumeUrl,
      },
    });
  }

  const { resume_text, resume_analysis } = resume;
  const parsedAnalysis = resume_analysis ? JSON.parse(resume_analysis) : {};

  // Optimize resume content using service
  const resumeJson = await optimizeResumeContent(
    resume_text,
    parsedAnalysis,
    resume_id
  );

  logger.info("Generating PDF from optimized resume", { resume_id });

  // Generate PDF from structured resume data
  const pdfBuffer = await generateResumePDF(resumeJson, resumeHtmlTemplate);

  // Upload PDF to AWS S3
  logger.info("Uploading PDF to AWS S3", {
    resume_id,
    fileSize: pdfBuffer.length,
  });
  const mockFile = {
    buffer: pdfBuffer,
    originalname: "optimized-resume.pdf",
    mimetype: "application/pdf",
    size: pdfBuffer.length,
  };

  const uploadResult = await s3Uploader(mockFile);

  if (!uploadResult.success) {
    logger.error("Failed to upload PDF to AWS S3", {
      resume_id,
      error: "S3 upload failed",
    });
    throw new AppError(500, "Failed to upload PDF to AWS S3");
  }

  logger.info("PDF uploaded to AWS S3 successfully", {
    resume_id,
    url: uploadResult.url,
  });

  // Update resume record with the optimized PDF URL
  await updateResume(resume_id, { optimized_resumeUrl: uploadResult.url });

  logger.info("Resume optimization and PDF generation completed successfully", {
    resume_id,
    pdfUrl: uploadResult.url,
  });

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

  // Extract original filename from S3 URL
  const resumesData = resumes.map((resume) => {
    const originalResumeName = extractOriginalFileName(resume.resume_fileUrl);

    return {
      ...resume,
      original_resume_name: originalResumeName,
    };
  });

  res.status(200).json({
    success: true,
    message: "Resumes fetched successfully",
    data: {
      resumes: resumesData,
      count: resumesData.length,
    },
  });
});

export const getResume = catchAsync(async (req, res) => {
  const { resume_id } = req.params;

  logger.info("Fetching resume details", { resume_id });

  const resume = await getResumeById(resume_id);

  if (!resume) {
    throw new AppError(404, "Resume not found");
  }

  // Parse resume analysis from JSON
  const parsedAnalysis = resume.resume_analysis ? JSON.parse(resume.resume_analysis) : {};

  return res.status(200).json({
    success: true,
    message: "Resume details fetched successfully",
    data: {
      resume_id: resume.id,
      user_id: resume.user_id,
      resume_analysis: parsedAnalysis,
      resume_analysis_score: resume.resume_analysis_score,
      original_resume_url: resume.resume_fileUrl,
      optimized_resume_url: resume.optimized_resumeUrl,
      created_at: resume.createdAt,
      updated_at: resume.updatedAt,
    },
  });
});