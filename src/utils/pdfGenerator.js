import puppeteer from "puppeteer";

/**
 * Generate PDF from HTML content using Puppeteer
 * @param {string} html - HTML content to convert to PDF
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generatePDFFromHtml = async (html) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-accelerated-2d-canvas", "--disable-gpu"],
    });

    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Generate PDF with optimal settings for resumes
    const pdfBuffer = await page.pdf({
      format: "Letter",
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Generate PDF from JSON resume data
 * @param {Object} resumeData - Structured resume data
 * @param {Function} htmlTemplate - Function to generate HTML from resume data
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateResumePDF = async (resumeData, htmlTemplate) => {
  try {
    const html = htmlTemplate(resumeData);
    const pdfBuffer = await generatePDFFromHtml(html);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating resume PDF:", error);
    throw error;
  }
};
