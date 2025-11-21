import emailService from '../services/email.service.js';

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    const result = await emailService.sendContactEmail({
      name,
      email,
      subject,
      message,
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in sendContactEmail controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const verifyEmailConfig = async (req, res) => {
  try {
    const isVerified = await emailService.verifyConnection();

    return res.status(200).json({
      success: true,
      verified: isVerified,
    });
  } catch (error) {
    console.error('Error verifying email config:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify email configuration',
    });
  }
};
