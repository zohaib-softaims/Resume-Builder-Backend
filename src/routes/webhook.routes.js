import { Router } from "express";
import { clerkWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/clerk", clerkWebhook);

export default router;
