import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getOverallStats } from "../controllers/user.controller.js";

const router = Router();

router.get("/stats", requireAuth, getOverallStats);

export default router;
