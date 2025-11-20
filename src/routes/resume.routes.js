import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";
import { parseResume, optimizeResume, getUserResumes, getResume, deleteResume } from "../controllers/resume.controller.js";
import { resumeFileValidator } from "../validators/resumeFile.validator.js";
import { resumeJsonValidator } from "../validators/resumeJson.validator.js";
import { parseResumeHandler } from "../middleware/parseResumeHandler.middleware.js";
import { optimizeResumeSchema } from "../validators/resume.validator.js";
import { validate } from "../middleware/validator.js";

const router = Router();

// Parse resume - handles both file upload and JSON data (PUBLIC - guests allowed)
router.post(
  "/parse",
  optionalAuth, // Changed from requireAuth to optionalAuth
  parseResumeHandler,
  (req, res, next) => {
    // Only apply multer for file uploads
    if (req.isFileUpload) {
      return upload.single("resume")(req, res, next);
    }
    next();
  },
  (req, res, next) => {
    // Apply appropriate validator based on request type
    if (req.isFileUpload) {
      return resumeFileValidator(req, res, next);
    } else if (req.isJsonResume) {
      return resumeJsonValidator(req, res, next);
    }
    next();
  },
  parseResume
);
router.post("/optimize", requireAuth, validate(optimizeResumeSchema), optimizeResume);
router.get("/", requireAuth, getUserResumes);
router.get("/:resume_id", optionalAuth, getResume); // Allow guests to view their own resumes
router.delete("/:resume_id", requireAuth, deleteResume);

export default router;
