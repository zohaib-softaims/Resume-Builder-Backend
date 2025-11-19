import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  scrapJob,
  getJob,
  getUserJobs,
  generateResumeFromJson,
  deleteJob,
} from "../controllers/job.controller.js";
import {
  generateSuggestionsHandler,
  getSuggestionsHandler,
  optimizeWithAcceptedSuggestionsHandler,
} from "../controllers/jobSuggestions.controller.js";
import {
  scrapJobSchema,
  generateResumeFromJsonSchema,
  generateSuggestionsSchema,
  optimizeWithSuggestionsSchema,
} from "../validators/job.validator.js";
import { validate } from "../middleware/validator.js";

const router = Router();

router.post("/scrap-job", requireAuth, validate(scrapJobSchema), scrapJob);

// Suggestion-based optimization flow
router.post(
  "/optimize",
  requireAuth,
  validate(generateSuggestionsSchema),
  generateSuggestionsHandler
);
router.get("/suggestions/:job_id", requireAuth, getSuggestionsHandler);
router.post(
  "/optimize-with-suggestions",
  requireAuth,
  validate(optimizeWithSuggestionsSchema),
  optimizeWithAcceptedSuggestionsHandler
);

router.post(
  "/generate-from-json",
  requireAuth,
  validate(generateResumeFromJsonSchema),
  generateResumeFromJson
);
router.get("/", requireAuth, getUserJobs);
router.get("/:job_id", requireAuth, getJob);
router.delete("/:job_id", requireAuth, deleteJob);

export default router;
