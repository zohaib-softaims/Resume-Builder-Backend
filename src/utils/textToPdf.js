import { generatePDFFromHtml } from "./pdfGenerator.js";

/**
 * Convert plain text resume to PDF
 * Creates a simple formatted HTML from text and converts to PDF
 * @param {string} text - Plain text resume content
 * @param {string} filename - Original filename (used for title)
 * @returns {Promise<Buffer>} PDF buffer
 */
export const convertTextToPDF = async (text, filename = "Resume") => {
  // Create a simple, clean HTML template for the text resume
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 100%;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <div class="container">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    </body>
    </html>
  `;

  return await generatePDFFromHtml(html);
};

/**
 * Convert formatted HTML resume to PDF (preserves DOCX formatting)
 * Uses the same styling as the optimized resume template
 * @param {string} htmlContent - HTML content with formatting from DOCX
 * @param {string} filename - Original filename
 * @returns {Promise<Buffer>} PDF buffer
 */
export const convertFormattedHtmlToPDF = async (htmlContent, filename = "Resume") => {
  // Use the same styling as resumeTemplate.js for consistency
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          color: #000;
          padding: 16px;
          max-width: 800px;
          margin: auto;
          line-height: 1.5;
          font-size: 14px;
        }

        h1 {
          font-size: 28px;
          text-align: center;
          margin: 0;
          margin-bottom: 10px;
        }

        h2 {
          font-size: 17px;
          margin-bottom: 2px;
          margin-top: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: bold;
        }

        h3 {
          font-weight: bold;
          font-size: 15px;
        }

        /* Center the first paragraph (usually contact info) */
        p:first-of-type {
          text-align: center;
          font-size: 13px;
        }

        hr {
          border: none;
          border-top: 1px solid #333;
          margin: 2px 0 12px 0;
        }

        p {
          margin: 5px 0;
        }

        ul, ol {
          padding-left: 18px;
          margin: 6px 0;
        }

        ul li, ol li {
          margin-bottom: 4px;
        }

        strong, b {
          font-weight: bold;
        }

        em, i {
          font-style: italic;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }

        td, th {
          padding: 5px;
          text-align: left;
        }

        /* Remove link styling - make links look like regular text */
        a {
          color: #000;
          text-decoration: none;
        }

        /* Make icons/symbols much smaller and less prominent */
        body::before {
          content: '';
        }

        /* Target common icon fonts and symbols */
        [class*="icon"],
        [class*="fa-"],
        .material-icons,
        .glyphicon {
          font-size: 8px;
          opacity: 0.3;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  return await generatePDFFromHtml(html);
};
