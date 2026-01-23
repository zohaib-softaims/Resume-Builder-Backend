import { Router } from "express";
import { adminLogin, getMe } from "../controllers/admin.controller.js";
import { getOverviewStats, getUsers } from "../controllers/user.controller.js";
import {
  getResumeAnalysisStatsController,
  getResumeAnalysisListController,
  getResumeAnalysisByUserIdController,
} from "../controllers/resume.controller.js";
import {
  getJobAnalysisStatsController,
  getJobAnalysisListController,
  getJobAnalysisByUserIdController,
} from "../controllers/job.controller.js";
import { getVisitorStatsController } from "../controllers/visitor.controller.js";
import { validate } from "../middleware/validator.js";
import { adminLoginSchema } from "../validators/admin.validator.js";
import { requireAdminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

router.post("/login", validate(adminLoginSchema), adminLogin);
router.get("/me", requireAdminAuth, getMe);
router.get("/users/overview/stats", requireAdminAuth, getOverviewStats);
router.get("/users", requireAdminAuth, getUsers);
router.get("/resumes/stats", requireAdminAuth, getResumeAnalysisStatsController);
router.get("/resumes", requireAdminAuth, getResumeAnalysisListController);
router.get("/resumes/:userId", requireAdminAuth, getResumeAnalysisByUserIdController);
router.get("/jobs/stats", requireAdminAuth, getJobAnalysisStatsController);
router.get("/jobs", requireAdminAuth, getJobAnalysisListController);
router.get("/jobs/:userId", requireAdminAuth, getJobAnalysisByUserIdController);
router.get("/visitors/stats", requireAdminAuth, getVisitorStatsController);

export default router;
