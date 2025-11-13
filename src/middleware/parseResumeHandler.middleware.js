/**
 * Middleware to handle both file upload and JSON data for resume parsing
 * Determines the request type and sets appropriate flags
 */
export const parseResumeHandler = (req, res, next) => {
  const contentType = req.get('Content-Type');

  // Check if it's a JSON request
  if (contentType && contentType.includes('application/json')) {
    req.isJsonResume = true;
    req.isFileUpload = false;
    return next();
  }

  // Check if it's a file upload (multipart/form-data)
  if (contentType && contentType.includes('multipart/form-data')) {
    req.isJsonResume = false;
    req.isFileUpload = true;
    return next();
  }

  // Unknown content type
  return res.status(400).json({
    success: false,
    message: 'Invalid content type. Expected multipart/form-data or application/json',
  });
};
