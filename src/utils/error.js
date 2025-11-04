import logger from "../lib/logger.js";

export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = err.errors[0].message;
  }

  // Handle Supabase errors
  if (err.status) {
    statusCode = err.status;
  }

  // Log the error with full context
  logger.error(`API Error: ${message}`, {
    statusCode,
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.auth?.userId || 'anonymous',
  });

  res.status(statusCode).json({
    success: false,
    message,
  });
};
