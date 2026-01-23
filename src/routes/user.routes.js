import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getOverallStats, markConsiliariClickedController } from "../controllers/user.controller.js";


const router = Router();

router.get("/stats", requireAuth, getOverallStats);
router.post("/consiliari-clicked", requireAuth, markConsiliariClickedController);

export default router;
