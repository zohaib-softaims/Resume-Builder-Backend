import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";
import { parseResume } from "../controllers/resume.controller.js";
import { resumeFileValidator } from "../validators/resumeFile.validator.js";

const router = Router();

router.post("/parse", requireAuth, upload.single("resume"), resumeFileValidator, parseResume);

export default router;
