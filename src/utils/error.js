export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err}`);
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

  res.status(statusCode).json({
    success: false,
    message,
  });
};
