import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createCheckoutHandler,
  verifyCheckoutHandler,
  getPaymentStatusHandler,
} from "../controllers/payment.controller.js";
import {
  createCheckoutSchema,
  getPaymentStatusSchema,
} from "../validators/payment.validator.js";
import { validate } from "../middleware/validator.js";

const router = Router();

// Create checkout session
router.post(
  "/create-checkout",
  requireAuth,
  validate(createCheckoutSchema),
  createCheckoutHandler
);

// Verify checkout session (called after redirect from Stripe)
router.get("/verify-checkout", verifyCheckoutHandler);

// Get payment status
router.get(
  "/status/:resume_id",
  requireAuth,
  validate(getPaymentStatusSchema),
  getPaymentStatusHandler
);

export default router;

