import axios from "axios";
import OpenAI from "openai";
import { catchAsync } from "../utils/error.js";
import { sanitizedText } from "../utils/sanitizedText.js";
import { convert } from "html-to-text";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  console.log("job text length", jobText);
  // Limit text to 8000 characters to avoid token limits
  if (jobText.length > 100000) {
    jobText = jobText.substring(0, 100000);
  }
  // console.log("job text", jobText);
  // 3️⃣ Use OpenAI to extract structured job data
  const aiResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Extract structured job data from this job posting content. 
        Include title, company, location, requirements, and description. 
        Only extract information that is clearly present in the text.
        
        Job posting content:
        ${jobText}`,
      },
    ],
  });

  res.json({
    success: true,
    message: "Job data fetched successfully via ScrapingBee + OpenAI",
    data: aiResponse.choices[0].message.content,
  });
});
