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
import logger from "../lib/logger.js";
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
  const response = await createResume(
    req.auth.userId,
    resumeText,
    uploadedResumeUrl,
    analysis,
    resumeAnalysisScore
  );

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
  const parsedAnalysis = JSON.parse(resume_analysis);

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

  res.status(200).json({
    success: true,
    message: "Resumes fetched successfully",
    data: {
      resumes,
      count: resumes.length,
    },
  });
});
