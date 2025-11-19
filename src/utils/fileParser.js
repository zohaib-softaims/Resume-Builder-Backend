import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import logger from "../lib/logger.js";
import { AppError } from "./error.js";

const PDF_PARSE_MAX_RETRIES = 3;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parsePdfWithRetries = async (fileBuffer) => {
  let lastError = null;

  for (let attempt = 1; attempt <= PDF_PARSE_MAX_RETRIES; attempt++) {
    try {
      logger.info(`Parsing PDF file (attempt ${attempt})`);
      const parsed = await pdfParse(fileBuffer);
      console.log("Parsed PDF text length:", parsed.text.length);
      console.log("parsing atttempt", attempt);
      return parsed;
    } catch (error) {
      lastError = error;
      logger.warn("PDF parsing attempt failed", {
        attempt,
        maxAttempts: PDF_PARSE_MAX_RETRIES,
        error: error.message,
      });

      if (attempt < PDF_PARSE_MAX_RETRIES) {
        // Small exponential backoff
        await delay(150 * attempt);
      }
    }
  }

  throw lastError;
};

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
      try {
        const parsed = await parsePdfWithRetries(fileBuffer);
        return parsed.text;
      } catch (pdfError) {
        logger.error("PDF parsing error:", pdfError);
        // Provide user-friendly error for PDF issues
        if (
          pdfError.message.includes("XRef") ||
          pdfError.message.includes("xref")
        ) {
          throw new AppError(
            400,
            "Resume parsing failed. Your PDF looks corrupted—please re-export it."
          );
        } else if (
          pdfError.message.includes("encrypt") ||
          pdfError.message.includes("password")
        ) {
          throw new AppError(
            400,
            "Resume parsing failed because the PDF is password protected. Remove the password and try again."
          );
        } else {
          throw new AppError(
            400,
            "Resume parsing failed. Try uploading a fresh PDF"
          );
        }
      }
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
      throw new AppError(
        400,
        `Unsupported file type: ${mimetype}. Supported formats are PDF, DOCX, and TXT.`
      );
    }
  } catch (error) {
    logger.error("File parsing error:", error);
    // Re-throw a safe, user-friendly error
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      400,
      "Resume parsing failed. Please upload a valid PDF, DOCX, or TXT file."
    );
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
