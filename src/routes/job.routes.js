import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { scrapJob, optimizeJobResume } from "../controllers/job.controller.js";
import { scrapJobSchema, optimizeJobResumeSchema } from "../validators/job.validator.js";
import { validate } from "../middleware/validator.js";

const router = Router();

router.post("/scrap-job", requireAuth, validate(scrapJobSchema), scrapJob);
router.post("/optimize", requireAuth, validate(optimizeJobResumeSchema), optimizeJobResume);

export default router;
