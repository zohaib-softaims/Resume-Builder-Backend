import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";
import { parseResume, optimizeResume } from "../controllers/resume.controller.js";
import { resumeFileValidator } from "../validators/resumeFile.validator.js";
import { optimizeResumeSchema } from "../validators/resume.validator.js";
import { validate } from "../middleware/validator.js";

const router = Router();

router.post("/parse", requireAuth, upload.single("resume"), resumeFileValidator, parseResume);
router.post("/optimize", requireAuth, validate(optimizeResumeSchema), optimizeResume);

export default router;
