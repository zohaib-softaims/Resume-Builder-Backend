import { Router } from "express";
import express from "express";
import { clerkWebhook, stripeWebhook } from "../controllers/webhook.controller.js";

const router = Router();


router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);
router.post("/clerk", express.json(), clerkWebhook);

export default router;
