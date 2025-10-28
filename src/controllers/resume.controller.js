import { catchAsync } from "../utils/error.js";
import pdfParse from "pdf-parse";
import { sanitizedText } from "../utils/sanitizedText.js";
import { resumeAnalysisPrompt, resumeAnalysisSchema } from "../llmPrompts/resumeAnalysisPrompt.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { s3Uploader } from "../utils/s3Uploader.js";
import { createResume } from "../services/resume.service.js";

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
  console.log("analysis", parsedAnalysis);
  const uploadResult = await s3Uploader(req.file);
  const uploadedResumeUrl = uploadResult.success ? uploadResult.url : null;
  req.auth.userId = "user_34eCDFynCiZvDHkz419GIdhY0Ky";
  await createResume(req.auth.userId, resumeText, uploadedResumeUrl, analysis);

  res.status(200).json({
    success: true,
    message: "Resume analyzed successfully",
    data: parsedAnalysis,
  });
});
