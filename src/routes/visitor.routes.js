import { Router } from "express";
import {
  trackAppVisitController,
  trackGuestResumeAnalysisController,
  trackFixAtsOrCustomizeClickedController,
  trackSignupButtonClickedController,
} from "../controllers/visitor.controller.js";

const router = Router();

router.post("/track-visit", trackAppVisitController);
router.post("/track-guest-resume-analysis", trackGuestResumeAnalysisController);
router.post("/track-fix-ats-or-customize", trackFixAtsOrCustomizeClickedController);
router.post("/track-signup-click", trackSignupButtonClickedController);

export default router;
