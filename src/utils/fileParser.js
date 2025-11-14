import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import logger from "../lib/logger.js";

/**
 * Parses resume files (PDF, DOCX, TXT) and extracts text content
 * @param {Buffer} fileBuffer - The file buffer to parse
 * @param {string} mimetype - The MIME type of the file
 * @returns {Promise<string>} - Extracted text from the file
 * @throws {Error} - If file type is unsupported or parsing fails
 */
export const parseResumeFile = async (fileBuffer, mimetype) => {
  try {
    logger.info(`Parsing file with MIME type: ${mimetype}`);

    if (mimetype === "application/pdf") {
      // Parse PDF file
      logger.info("Parsing PDF file");
      const parsed = await pdfParse(fileBuffer);
      return parsed.text;
    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      // Parse DOCX file
      logger.info("Parsing DOCX file");
      const result = await mammoth.extractRawText({ buffer: fileBuffer });

      if (result.messages && result.messages.length > 0) {
        logger.warn("DOCX parsing warnings:", result.messages);
      }

      return result.value;
    } else if (mimetype === "text/plain") {
      // Parse TXT file
      logger.info("Parsing TXT file");
      return fileBuffer.toString("utf-8");
    } else {
      throw new Error(
        `Unsupported file type: ${mimetype}. Supported formats are PDF, DOCX, and TXT.`
      );
    }
  } catch (error) {
    logger.error("File parsing error:", error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};

/**
 * Extracts formatted HTML from DOCX files (preserves formatting like headings, bold, bullets)
 * @param {Buffer} fileBuffer - The DOCX file buffer
 * @returns {Promise<string>} - HTML content with formatting
 * @throws {Error} - If parsing fails
 */
export const extractFormattedHtmlFromDocx = async (fileBuffer) => {
  try {
    logger.info("Extracting formatted HTML from DOCX file");

    // Use mammoth to convert DOCX to HTML (preserves formatting)
    const result = await mammoth.convertToHtml({ buffer: fileBuffer });

    if (result.messages && result.messages.length > 0) {
      logger.warn("DOCX to HTML conversion warnings:", result.messages);
    }

    return result.value;
  } catch (error) {
    logger.error("DOCX to HTML conversion error:", error);
    throw new Error(`Failed to extract HTML from DOCX: ${error.message}`);
  }
};
