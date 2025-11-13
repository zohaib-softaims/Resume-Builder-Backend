/**
 * Validator for JSON resume data
 * Validates the structure of form-created resume data
 */
export const resumeJsonValidator = (req, res, next) => {
  const resumeData = req.body;

  // Check if body exists
  if (!resumeData || Object.keys(resumeData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Resume data is required',
    });
  }

  // Validate required fields
  const requiredFields = ['name', 'email'];
  const missingFields = requiredFields.filter(field => !resumeData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(resumeData.email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  next();
};
