import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validator.js";
import { createSubscriptionSchema, createOneTimePaymentSchema, createCustomerPortalSchema } from "../validators/payment.validators.js";
import { createCheckoutSession, getUserSubscriptionPackage, createCustomerPortalSession, createOneTimePaymentSession, getPlans } from "../controllers/payment.controller.js";
const router = express.Router();

router.get("/plans", getPlans);
router.post("/subscribe", requireAuth, validate(createSubscriptionSchema), createCheckoutSession);
router.post("/one-time-payment", requireAuth, validate(createOneTimePaymentSchema), createOneTimePaymentSession);
router.get("/subscription", requireAuth, getUserSubscriptionPackage);
router.post("/customer-portal", requireAuth, validate(createCustomerPortalSchema), createCustomerPortalSession);
export default router;
