import { z } from "zod";

export const createSubscriptionSchema = z.object({
  stripeProductId: z.string().min(1, "Stripe product ID is required"),
  stripePriceId: z.string().min(1, "Stripe price ID is required"),
  planId: z.string().min(1, "Plan ID is required"),
  source: z.string().optional(),
  jobId: z.string().optional(), 
});

export const createOneTimePaymentSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

export const createCustomerPortalSchema = z.object({
  returnUrl: z.string().url("Invalid return URL").optional(),
});
