import puppeteer from "puppeteer";
import { convert } from "html-to-text";
import { catchAsync } from "../utils/error.js";
import { sanitizedText } from "../utils/sanitizedText.js";
import { getLLMResponse } from "../lib/llmConfig.js";
import { jobDescriptionPrompt } from "../llmPrompts/jobDescriptionPrompt.js";

export const scrapJob = catchAsync(async (req, res) => {
  const { job_url } = req.body;
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
    const systemPrompt = jobDescriptionPrompt(jobText);
    const aiResponse = await getLLMResponse({
      systemPrompt,
      messages: [],
      model: "gpt-4o-mini",
    });

    res.json({
      success: true,
      message: "Job data fetched successfully via Puppeteer + LLM",
      data: aiResponse,
    });
  } catch (err) {
    console.error("Scraping error:", err);
    if (browser) await browser.close();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});
