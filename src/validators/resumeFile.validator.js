export const resumeFileValidator = (req, res, next) => {
  const file = req.file;
  const allowedExtensions = [".pdf", ".docx", ".doc", ".txt"];
  const maxSizeInBytes = 5 * 1024 * 1024;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded. Please upload a resume file.",
    });
  }

  const extension = file.originalname.slice(((file.originalname.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();

  if (!allowedExtensions.includes(`.${extension}`)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type! Allowed: .pdf, .docx, .doc, .txt",
    });
  }

  if (file.size > maxSizeInBytes) {
    return res.status(400).json({
      success: false,
      message: "File size must not exceed 5MB.",
    });
  }

  next();
};
