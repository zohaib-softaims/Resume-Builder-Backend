import axios from "axios";
import { catchAsync } from "../utils/error.js";
import { sanitizedText } from "../utils/sanitizedText.js";
import { convert } from "html-to-text";
import { getLLMResponse } from "../lib/llmConfig.js";
import { jobDescriptionPrompt } from "../llmPrompts/jobDescriptionPrompt.js";

export const scrapJob = catchAsync(async (req, res) => {
  const { job_url } = req.body;

  // 1️⃣ Fetch HTML using ScrapingBee
  const scrapeResponse = await axios.get("https://app.scrapingbee.com/api/v1/", {
    params: {
      api_key: process.env.SCRAPINGBEE_API_KEY,
      url: job_url,
      render_js: true,
    },
  });

  const html = scrapeResponse.data;

  // 2️⃣ Extract only text content from HTML using html-to-text
  let jobText = convert(html, {
    wordwrap: false,
    preserveNewlines: true,
  });
  jobText = sanitizedText(jobText);
  // Limit text to 100000 characters to avoid token limits
  if (jobText.length > 100000) {
    jobText = jobText.substring(0, 100000);
  }
  // console.log("job text", jobText);
  // 3️⃣ Use LLM to extract and craft job description
  const systemPrompt = jobDescriptionPrompt(jobText);
  const aiResponse = await getLLMResponse({
    systemPrompt,
    messages: [],
    model: "gpt-4o-mini",
  });

  res.json({
    success: true,
    message: "Job data fetched successfully via ScrapingBee + LLM",
    data: aiResponse,
  });
});
