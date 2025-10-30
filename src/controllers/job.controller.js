import puppeteer from "puppeteer";
import { convert } from "html-to-text";
import { catchAsync } from "../utils/error.js";
import { sanitizedText } from "../utils/sanitizedText.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { jobDescriptionPrompt } from "../llmPrompts/jobDescriptionPrompt.js";
import { jobGapAnalysisPrompt, jobGapAnalysisSchema } from "../llmPrompts/jobGapAnalysisPrompt.js";
import { createJob } from "../services/job.service.js";
import { getResumeById } from "../services/resume.service.js";

export const scrapJob = catchAsync(async (req, res) => {
  const { job_url, resume_id } = req.body;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Use a real browser fingerprint to avoid being blocked
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Go to the job URL (increasing timeout)
    await page.goto(job_url, {
      waitUntil: "domcontentloaded",
      timeout: 30000, // wait up to 30s
    });

    // Get full HTML content
    const html = await page.content();

    // Convert HTML to plain text
    let jobText = convert(html, { wordwrap: false, preserveNewlines: true });
    jobText = sanitizedText(jobText);

    //  limit text to avoid token overflow
    if (jobText.length > 100000) {
      jobText = jobText.substring(0, 100000);
    }
    const jobDescPrompt = jobDescriptionPrompt(jobText);
    const jobDescription = await getLLMResponse({
      systemPrompt: jobDescPrompt,
      messages: [],
      model: "gpt-4o-mini",
    });

    // Fetch resume from database via service
    const resume = await getResumeById(resume_id);

    if (!resume) {
      if (browser) await browser.close();
      return res.status(404).json({
        success: false,
        error: "Resume not found",
      });
    }

    const resumeText = resume.resume_text;

    // Analyze job gap using LLM
    const systemPrompt = jobGapAnalysisPrompt(resumeText, jobDescription);
    const gapAnalysis = await getLLMResponse({
      systemPrompt,
      messages: [],
      model: "gpt-4o-2024-08-06",
      responseSchema: jobGapAnalysisSchema,
      schemaName: "job_gap_analysis",
    });
    const parsedGapAnalysis = JSON.parse(gapAnalysis);

    // Store in database
    const job = await createJob(resume_id, job_url, jobDescription, gapAnalysis);

    if (browser) await browser.close();
    return res.status(200).json({
      success: true,
      message: "Job scraped and gap analysis completed successfully",
      data: {
        job_id: job.id,
        job_description: jobDescription,
        job_gap_analysis: parsedGapAnalysis,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});
