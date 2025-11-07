import axios from "axios";
import { convert } from "html-to-text";
import { sanitizedText } from "../utils/sanitizedText.js";
import logger from "../lib/logger.js";

const SCRAPEFLY_API_URL = "https://api.scrapfly.io/scrape";

export const scrapeJobWithScrapfly = async (jobUrl, options = {}) => {
  const SCRAPEFLY_API_KEY = process.env.SCRAPEFLY_API_KEY;

  if (!SCRAPEFLY_API_KEY) {
    throw new Error(
      "SCRAPEFLY_API_KEY is not configured in environment variables"
    );
  }

  if (!jobUrl) {
    throw new Error("Job URL is required");
  }

  const {
    renderJs = true,
    proxyPool = "public_datacenter_pool",
    asp = true,
    timeout = 60000,
  } = options;

  const params = {
    key: SCRAPEFLY_API_KEY,
    url: jobUrl,
    render_js: renderJs,
    proxy_pool: proxyPool,
    asp: asp,
    format: "raw",
  };

  try {
    logger.info("Scraping job with Scrapefly", {
      url: jobUrl,
      renderJs,
      proxyPool,
    });

    const response = await axios.get(SCRAPEFLY_API_URL, {
      params,
      timeout,
    });

    if (!response.data || !response.data.result) {
      throw new Error("Invalid response from Scrapefly API");
    }

    const { result } = response.data;
    const html = result.content;

    if (!html) {
      throw new Error("No content received from Scrapefly API");
    }

    logger.info("Successfully fetched HTML from Scrapefly", {
      url: jobUrl,
      htmlLength: html.length,
      status: result.status_code,
    });

    let jobText = convert(html, {
      wordwrap: false,
      preserveNewlines: true,
      selectors: [
        { selector: "script", format: "skip" },
        { selector: "style", format: "skip" },
        { selector: "nav", format: "skip" },
        { selector: "footer", format: "skip" },
      ],
    });

    jobText = sanitizedText(jobText);

    const MAX_JOB_TEXT_LENGTH = 300000;
    if (jobText.length > MAX_JOB_TEXT_LENGTH) {
      logger.warn("Job text truncated", {
        url: jobUrl,
        originalLength: jobText.length,
        truncatedLength: MAX_JOB_TEXT_LENGTH,
      });
      jobText = jobText.substring(0, MAX_JOB_TEXT_LENGTH);
    }

    logger.info("Successfully cleaned job text", {
      url: jobUrl,
      cleanTextLength: jobText.length,
    });

    return jobText;
  } catch (error) {
    logger.error("Failed to scrape job with Scrapefly", {
      url: jobUrl,
      error: error.message,
      response: error.response?.data,
    });
    throw new Error(
      `Failed to scrape job from ${jobUrl} with Scrapefly: ${error.message}`
    );
  }
};
