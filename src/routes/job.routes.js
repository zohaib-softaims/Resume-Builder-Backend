import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  scrapJob,
  optimizeJobResume,
  getResumeComparisonJson,
  getJob,
  getUserJobs,
  generateResumeFromJson,
} from "../controllers/job.controller.js";
import {
  scrapJobSchema,
  optimizeJobResumeSchema,
  generateResumeFromJsonSchema,
} from "../validators/job.validator.js";
import { validate } from "../middleware/validator.js";

const router = Router();

router.post("/scrap-job", requireAuth, validate(scrapJobSchema), scrapJob);
router.post(
  "/optimize",
  requireAuth,
  validate(optimizeJobResumeSchema),
  // optimizeJobResume
  getResumeComparisonJson
);
router.post(
  "/generate-from-json",
  requireAuth,
  validate(generateResumeFromJsonSchema),
  generateResumeFromJson
);
router.get("/", requireAuth, getUserJobs);
router.get("/:job_id", requireAuth, getJob);

export default router;
