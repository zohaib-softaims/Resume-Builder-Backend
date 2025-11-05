import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetch HTML Script using Puppeteer
 * Fetches webpage HTML content with JavaScript rendering
 *
 * Usage: node scripts/fetch-html-puppeteer.js "<url>"
 * Example: node scripts/fetch-html-puppeteer.js "https://example.com"
 */

/**
 * Fetch fully rendered HTML using Puppeteer
 * @param {string} url - The URL to fetch
 * @returns {Promise<object>} Result with HTML and metadata
 */
const fetchPageHtmlWithPuppeteer = async (url) => {
  const startTime = Date.now();
  let browser = null;

  try {
    console.log(`\nLaunching browser...`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    console.log(`Opening new page...`);
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    });

    console.log(`Navigating to: ${url}`);
    console.log('Please wait while the page loads...\n');

    // Navigate to URL and wait for network to be idle
    const response = await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000, // 60 seconds
    });

    // Wait a bit more for any lazy-loaded content
    console.log('Waiting for dynamic content to load...');
    await page.waitForTimeout(3000);

    // Get the fully rendered HTML
    const html = await page.content();

    // Get page title
    const title = await page.title();

    // Get final URL (in case of redirects)
    const finalUrl = page.url();

    const endTime = Date.now();
    const duration = endTime - startTime;

    await browser.close();

    return {
      success: response.ok(),
      html: html,
      title: title,
      statusCode: response.status(),
      statusText: response.statusText(),
      finalUrl: finalUrl,
      duration: `${duration}ms`,
      htmlLength: html.length,
      contentType: response.headers()['content-type'],
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (browser) {
      await browser.close();
    }

    return {
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      details: {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
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
  const outputDir = path.join(__dirname, '../output');

  await fs.mkdir(outputDir, { recursive: true });

  const urlSlug = url
    .replace(/https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 50);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `puppeteer_${urlSlug}_${timestamp}.html`;
  const filepath = path.join(outputDir, filename);

  await fs.writeFile(filepath, html, 'utf-8');

  return filepath;
};

/**
 * Print fetch results
 * @param {object} result - Result from fetch operation
 */
const printResults = (result) => {
  console.log('');
  console.log('='.repeat(80));
  console.log('FETCH RESULTS');
  console.log('='.repeat(80));
  console.log('');

  if (result.success) {
    console.log('✓ SUCCESS');
    console.log('─'.repeat(80));
    console.log(`Title:        ${result.title}`);
    console.log(`Status:       ${result.statusCode} ${result.statusText}`);
    console.log(`Duration:     ${result.duration}`);
    console.log(`HTML Length:  ${result.htmlLength.toLocaleString()} characters`);
    console.log(`Content Type: ${result.contentType}`);
    console.log(`Final URL:    ${result.finalUrl}`);
    console.log('');
    console.log('HTML Preview (first 800 characters):');
    console.log('─'.repeat(80));
    console.log(result.html.substring(0, 800));
    if (result.html.length > 800) {
      console.log('\n... (truncated)');
    }
  } else {
    console.log('✗ FAILED');
    console.log('─'.repeat(80));
    console.log(`Error:        ${result.error}`);
    console.log(`Duration:     ${result.duration}`);
    if (result.details) {
      console.log('\nError Details:');
      console.log(`Message: ${result.details.message}`);
      console.log('\nStack:');
      console.log(result.details.stack);
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('');
};

/**
 * Main function
 */
const run = async () => {
  const url = process.argv[2];

  if (!url) {
    console.error('Error: Please provide a URL');
    console.log('\nUsage: node scripts/fetch-html-puppeteer.js "<url>"');
    console.log(
      'Example: node scripts/fetch-html-puppeteer.js "https://example.com"'
    );
    process.exit(1);
  }

  console.log('='.repeat(80));
  console.log('HTML FETCH SCRIPT (PUPPETEER)');
  console.log('='.repeat(80));
  console.log(`Target URL: ${url}`);
  console.log('='.repeat(80));

  // Fetch HTML
  const result = await fetchPageHtmlWithPuppeteer(url);

  // Print results
  printResults(result);

  // Save HTML file if successful
  if (result.success && result.html) {
    try {
      const filepath = await saveHtmlToFile(url, result.html);
      console.log(`✓ HTML saved to: ${filepath}`);
      console.log('');
    } catch (error) {
      console.error(`✗ Failed to save file: ${error.message}`);
    }
  }

  console.log('='.repeat(80));
  console.log('COMPLETE');
  console.log('='.repeat(80));
  console.log('');
};

// Run the script
run().catch((error) => {
  console.error('\nFatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
