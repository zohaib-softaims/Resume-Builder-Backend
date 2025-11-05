import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetch HTML Script using Axios
 * Fetches webpage HTML content and saves it to a file
 *
 * Usage: node scripts/fetch-html-comparison.js "<url>"
 * Example: node scripts/fetch-html-comparison.js "https://example.com"
 */

/**
 * Fetch HTML using axios with proper configuration
 * @param {string} url - The URL to fetch
 * @returns {Promise<object>} Result with HTML and metadata
 */
const fetchPageHtml = async (url) => {
  const startTime = Date.now();

  try {
    console.log(`\nFetching HTML from: ${url}`);
    console.log("Please wait...\n");

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
      timeout: 30000, // 30 seconds
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept any status < 500
      responseType: "text", // Ensure we get text response
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Get the HTML content as string
    const html =
      typeof response.data === "string" ? response.data : String(response.data);

    return {
      success: response.status >= 200 && response.status < 300,
      html: html,
      statusCode: response.status,
      statusText: response.statusText,
      headers: response.headers,
      duration: `${duration}ms`,
      htmlLength: html.length,
      contentType: response.headers["content-type"],
      finalUrl: response.request?.res?.responseUrl || url,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: false,
      error: error.message,
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      duration: `${duration}ms`,
      details: {
        code: error.code,
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      },
    };
  }
};

/**
 * Save HTML to file
 * @param {string} url - The original URL
 * @param {string} html - The HTML content
 * @returns {Promise<string>} The path to the saved file
 */
const saveHtmlToFile = async (url, html) => {
  const outputDir = path.join(__dirname, "../output");

  await fs.mkdir(outputDir, { recursive: true });

  const urlSlug = url
    .replace(/https?:\/\//, "")
    .replace(/[^a-z0-9]/gi, "_")
    .substring(0, 50);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `page_${urlSlug}_${timestamp}.html`;
  const filepath = path.join(outputDir, filename);

  await fs.writeFile(filepath, html, "utf-8");

  return filepath;
};

/**
 * Print fetch results
 * @param {object} result - Result from fetch operation
 */
const printResults = (result) => {
  console.log("");
  console.log("=".repeat(80));
  console.log("FETCH RESULTS");
  console.log("=".repeat(80));
  console.log("");

  if (result.success) {
    console.log("✓ SUCCESS");
    console.log("─".repeat(80));
    console.log(`Status:       ${result.statusCode} ${result.statusText}`);
    console.log(`Duration:     ${result.duration}`);
    console.log(
      `HTML Length:  ${result.htmlLength.toLocaleString()} characters`
    );
    console.log(`Content Type: ${result.contentType}`);
    console.log(`Final URL:    ${result.finalUrl}`);
    console.log("");
    console.log("HTML Preview (first 500 characters):");
    console.log("─".repeat(80));
    console.log(result.html.substring(0, 500));
    if (result.html.length > 500) {
      console.log("\n... (truncated)");
    }
  } else {
    console.log("✗ FAILED");
    console.log("─".repeat(80));
    console.log(`Error:        ${result.error}`);
    console.log(`Status Code:  ${result.statusCode || "N/A"}`);
    console.log(`Status Text:  ${result.statusText || "N/A"}`);
    console.log(`Duration:     ${result.duration}`);
    if (result.details) {
      console.log("\nError Details:");
      console.log(`Code:    ${result.details.code || "N/A"}`);
      console.log(`Message: ${result.details.message}`);
    }
  }

  console.log("");
  console.log("=".repeat(80));
  console.log("");
};

/**
 * Main function
 */
const run = async () => {
  const url = process.argv[2];

  if (!url) {
    console.error("Error: Please provide a URL");
    console.log('\nUsage: node scripts/fetch-html-comparison.js "<url>"');
    console.log(
      'Example: node scripts/fetch-html-comparison.js "https://example.com"'
    );
    process.exit(1);
  }

  console.log("=".repeat(80));
  console.log("HTML FETCH SCRIPT (AXIOS)");
  console.log("=".repeat(80));
  console.log(`Target URL: ${url}`);
  console.log("=".repeat(80));

  // Fetch HTML
  const result = await fetchPageHtml(url);

  // Print results
  printResults(result);

  // Save HTML file if successful
  if (result.success && result.html) {
    try {
      const filepath = await saveHtmlToFile(url, result.html);
      console.log(`✓ HTML saved to: ${filepath}`);
      console.log("");
    } catch (error) {
      console.error(`✗ Failed to save file: ${error.message}`);
    }
  }

  console.log("=".repeat(80));
  console.log("COMPLETE");
  console.log("=".repeat(80));
  console.log("");
};

// Run the script
run().catch((error) => {
  console.error("\nFatal error:", error.message);
  console.error(error.stack);
  process.exit(1);
});
